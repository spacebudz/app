{-# LANGUAGE DataKinds                  #-}
{-# LANGUAGE DeriveAnyClass             #-}
{-# LANGUAGE DeriveGeneric              #-}
{-# LANGUAGE DerivingStrategies         #-}
{-# LANGUAGE FlexibleContexts           #-}
{-# LANGUAGE GeneralizedNewtypeDeriving #-}
{-# LANGUAGE LambdaCase                 #-}
{-# LANGUAGE MultiParamTypeClasses      #-}
{-# LANGUAGE NoImplicitPrelude          #-}
{-# LANGUAGE OverloadedStrings          #-}
{-# LANGUAGE RecordWildCards            #-}
{-# LANGUAGE ScopedTypeVariables        #-}
{-# LANGUAGE TemplateHaskell            #-}
{-# LANGUAGE TypeApplications           #-}
{-# LANGUAGE TypeFamilies               #-}
{-# LANGUAGE TypeOperators              #-}
{-# LANGUAGE BangPatterns               #-}


import Playground.Contract
import Wallet.Emulator.Wallet as Emulator
import Plutus.Contract
import           Data.Map             as Map
import qualified Prelude              as Haskell
--
import           Control.Monad        hiding (fmap)
import           Data.Aeson           (ToJSON, FromJSON,encode)
import           Data.List.NonEmpty   (NonEmpty (..))
import           Data.Text            (pack, Text)
import           GHC.Generics         (Generic)
import qualified PlutusTx
import           PlutusTx.Prelude     as P
import           Ledger               hiding (singleton)
import           Ledger.Credential    (Credential (..))
import           Ledger.Constraints   as Constraints
import qualified Ledger.Scripts       as Scripts
import qualified Ledger.Typed.Scripts as Scripts
import           Ledger.Value         as Value
import           Ledger.Ada           as Ada hiding (divide)
import           Prelude              ((/), Float, toInteger, floor)
import           Text.Printf          (printf)
import qualified PlutusTx.AssocMap    as AssocMap
import qualified Data.ByteString.Short as SBS
import qualified Data.ByteString.Lazy  as LBS
import           Cardano.Api hiding (Value, TxOut)
import           Cardano.Api.Shelley hiding (Value, TxOut)
import           Codec.Serialise hiding (encode)
import qualified Plutus.V1.Ledger.Api as Plutus

-- Contract
-- Total Fee: 2.4%

data ContractInfo = ContractInfo
    { policySpaceBudz :: !CurrencySymbol
    , policyBid :: !CurrencySymbol
    , prefixSpaceBud :: !BuiltinByteString
    , prefixSpaceBudBid :: !BuiltinByteString
    , owner1 :: !(PubKeyHash, Integer, Integer)
    , owner2 :: !(PubKeyHash, Integer)
    , extraRecipient :: !Integer
    , minPrice :: !Integer
    , bidStep :: !Integer
    } deriving (Generic, ToJSON, FromJSON)

toFraction :: Float -> Integer
toFraction p = toInteger $ floor (1 / (p / 1000))


contractInfo = ContractInfo 
    { policySpaceBudz = "d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc"
    , policyBid = "800df05a0cc6b6f0d28aaa1812135bd9eebfbf5e8e80fd47da9989eb"
    , prefixSpaceBud = "SpaceBud"
    , prefixSpaceBudBid = "SpaceBudBid"
    , owner1 = ("826d9fafe1b3acf15bd250de69c04e3fc92c4493785939e069932e89", 416, 625) -- 2.4% 1.6%
    , owner2 = ("88269f8b051a739300fe743a7b315026f4614ce1216a4bb45d7fd0f5", 2500) -- 0.4%
    , extraRecipient = 2500 -- 0.4%
    , minPrice = 70000000
    , bidStep = 10000
    }

-- Data and Redeemers

data TradeDetails = TradeDetails
    { tradeOwner :: !PubKeyHash
    , budId :: !BuiltinByteString
    , requestedAmount :: !Integer
    } deriving (Generic, ToJSON, FromJSON)

instance Eq TradeDetails where
    {-# INLINABLE (==) #-}
    -- tradeOwner is not compared, since tradeOwner can changes with each trade/higher bid
    a == b = (budId  a == budId  b) &&
             (requestedAmount a == requestedAmount b)

data TradeDatum = StartBid | Bid TradeDetails | Offer TradeDetails 
    deriving (Generic, ToJSON, FromJSON)

-- only compare necessary types in order to save storage!!
instance Eq TradeDatum where
    {-# INLINABLE (==) #-}
    StartBid == StartBid = True
    Bid a == Bid b = a == b


data TradeAction = Buy | Sell | BidHigher | Cancel
    deriving (Generic, ToJSON, FromJSON)

-- Validator

{-# INLINABLE tradeValidate #-}
tradeValidate :: ContractInfo -> TradeDatum -> TradeAction -> ScriptContext -> Bool
tradeValidate contractInfo@ContractInfo{..} tradeDatum tradeAction context = case tradeDatum of
    StartBid -> case tradeAction of
        BidHigher -> correctStartBidOutputs

    Bid details@TradeDetails{..} -> case tradeAction of
        BidHigher -> 
            Bid details == scriptOutputDatum && -- expected correct script output datum
            Ada.fromValue (scriptInputValue) + Ada.lovelaceOf bidStep <= Ada.fromValue scriptOutputValue && -- expected correct bid amount
            containsPolicyBidNFT scriptOutputValue budId && -- expected correct bidPolicy NFT
            case txInfo `txSignedBy` tradeOwner of True -> True; False -> Ada.fromValue (valuePaidTo txInfo tradeOwner) >= Ada.fromValue scriptInputValue -- expected previous bidder refund
        Sell -> 
            scriptOutputDatum == StartBid && -- expected correct script output datum
            containsPolicyBidNFT scriptOutputValue budId && -- expected correct bidPolicy NFT
            containsSpaceBudNFT (valuePaidTo txInfo tradeOwner) budId && -- expected bidder to be paid
            correctSplit (getLovelace (Ada.fromValue scriptInputValue)) signer -- expected ada to be split correctly
        Cancel -> 
            txInfo `txSignedBy` tradeOwner && -- expected correct owner
            scriptOutputDatum == StartBid && -- expected correct script output datum
            containsPolicyBidNFT scriptOutputValue budId -- expected correct bidPolicy NFT

    Offer TradeDetails{..} -> case tradeAction of
        Buy ->
            containsSpaceBudNFT (valuePaidTo txInfo signer) budId && -- expected buyer to be paid
            requestedAmount >= minPrice && -- expected at least minPrice buy
            correctSplit requestedAmount tradeOwner -- expected ada to be split correctly
        Cancel -> 
            txInfo `txSignedBy` tradeOwner -- expected correct owner

    where
        txInfo :: TxInfo
        txInfo = scriptContextTxInfo context

        policyAssets :: Value -> CurrencySymbol -> [(CurrencySymbol, TokenName, Integer)]
        policyAssets v cs = P.filter (\(cs',_,am) -> cs == cs' && am == 1) (flattenValue v)

        signer :: PubKeyHash
        signer = case txInfoSignatories txInfo of
            [pubKeyHash] -> pubKeyHash

        (owner1PubKeyHash, owner1Fee1, owner1Fee2) = owner1
        (owner2PubKeyHash, owner2Fee1) = owner2

        -- minADA requirement forces the contract to give up certain fee recipients
        correctSplit :: Integer -> PubKeyHash -> Bool
        correctSplit lovelaceAmount tradeRecipient
            | lovelaceAmount >= 400000000 = let (amount1, amount2, amount3) = (lovelacePercentage lovelaceAmount (owner1Fee2),lovelacePercentage lovelaceAmount (owner2Fee1),lovelacePercentage lovelaceAmount extraRecipient) 
                in 
                  Ada.fromValue (valuePaidTo txInfo owner1PubKeyHash) >= Ada.lovelaceOf amount1 && -- expected owner1 to receive right amount
                  Ada.fromValue (valuePaidTo txInfo owner2PubKeyHash) >= Ada.lovelaceOf amount2 && -- expected owner2 to receive right amount
                  Ada.fromValue (valuePaidTo txInfo tradeRecipient) >= Ada.lovelaceOf (lovelaceAmount - amount1 - amount2 - amount3) -- expected trade recipient to receive right amount
            | otherwise = let amount1 = lovelacePercentage lovelaceAmount (owner1Fee1)
                in
                  Ada.fromValue (valuePaidTo txInfo owner1PubKeyHash) >= Ada.lovelaceOf amount1 && -- expected owner1 to receive right amount
                  Ada.fromValue (valuePaidTo txInfo tradeRecipient) >= Ada.lovelaceOf (lovelaceAmount - amount1) -- expected trade recipient to receive right amount
          
        lovelacePercentage :: Integer -> Integer -> Integer
        lovelacePercentage am p = (am * 10) `divide` p


        outputInfo :: TxOut -> (Value, TradeDatum)
        outputInfo o = case txOutAddress o of
            Address (ScriptCredential _) _  -> case txOutDatumHash o of
                Just h -> case findDatum h txInfo of
                    Just (Datum d) ->  case PlutusTx.fromBuiltinData d of
                        Just b -> (txOutValue o, b)

        policyBidLength :: Value -> Integer
        policyBidLength v = length $ policyAssets v policyBid

        containsPolicyBidNFT :: Value -> BuiltinByteString -> Bool
        containsPolicyBidNFT v tn = valueOf v policyBid (TokenName (prefixSpaceBudBid <> tn)) >= 1

        containsSpaceBudNFT :: Value -> BuiltinByteString -> Bool
        containsSpaceBudNFT v tn = valueOf v policySpaceBudz (TokenName (prefixSpaceBud <> tn)) >= 1

        -- eager evaluation to check correct script inputs for all branches!!     
        scriptInputValue :: Value
        !scriptInputValue =
            let
                isScriptInput i = case (txOutDatumHash . txInInfoResolved) i of
                    Nothing -> False
                    Just _  -> True
                xs = [ txOutValue (txInInfoResolved i)  | i <- txInfoInputs txInfo, isScriptInput i]
            in
                case xs of
                    [v] -> v -- normally just one script input is allowed
                    [v1, v2] -> 
                        -- allow 2 script inputs if it's a combination of cancelling bid and buying OR cancelling offer and selling (same SpaceBud only)
                        case tradeDatum of
                            (Bid TradeDetails{..}) -> case (containsPolicyBidNFT v1 budId, containsSpaceBudNFT v2 budId) of
                                    (True, True) -> v1 -- expected script input 1 to contain bid token and script input 2 SpaceBud 
                                    (False, False) -> v2 -- expected script input 2 to contain bid token and script input 1 SpaceBud
                            (Offer TradeDetails{..}) -> case (containsSpaceBudNFT v1 budId, containsPolicyBidNFT v2 budId) of
                                (True, True) -> v1 -- expected script input 2 to contain bid token and script input 1 SpaceBud 
                                (False, False) -> v2 -- expected script input 1 to contain bid token and script input 2 SpaceBud
                                 

        scriptOutputValue :: Value
        scriptOutputDatum :: TradeDatum
        (scriptOutputValue, scriptOutputDatum) = case getContinuingOutputs context of
            [o] -> outputInfo o

        -- 2 outputs possible because of distribution of inital bid NFT tokens and only applies if datum is StartBid
        correctStartBidOutputs :: Bool
        correctStartBidOutputs = if policyBidLength scriptInputValue > 1 
            then 
                case getContinuingOutputs context of
                    [o1, o2] -> let (info1, info2) = (outputInfo o1, outputInfo o2) in
                                case info1 of
                                    (v1, StartBid) -> 
                                        policyBidLength scriptInputValue - 1 == policyBidLength v1 && -- expected correct policyBid NFTs amount in output
                                        case info2 of
                                            (v2, Bid TradeDetails{..}) ->
                                                containsPolicyBidNFT v2 budId && -- expected policyBid NFT in output
                                                getLovelace (Ada.fromValue v2) >= minPrice && -- expected at least minPrice bid
                                                requestedAmount == 1 -- expeced correct output datum amount
                                    (v1, Bid TradeDetails{..}) -> 
                                        containsPolicyBidNFT v1 budId && -- expected policyBid NFT in output
                                        getLovelace (Ada.fromValue v1) >= minPrice && -- expected at least minPrice bid
                                        requestedAmount == 1 && -- expeced correct output datum amount
                                        case info2 of
                                            (v2, StartBid) -> 
                                                policyBidLength scriptInputValue - 1 == policyBidLength v2 -- expect correct policyBid NFTs amount in output
            else
                case getContinuingOutputs context of
                    [o] -> let (value, datum) = outputInfo o in case datum of
                            (Bid TradeDetails{..}) ->
                                containsPolicyBidNFT value budId && -- expected policyBid NFT in output
                                getLovelace (Ada.fromValue value) >= minPrice && -- expected at least minPrice bid
                                requestedAmount == 1 -- expeced correct output datum amount

        

      
data Trade
instance Scripts.ValidatorTypes Trade where
    type instance RedeemerType Trade = TradeAction
    type instance DatumType Trade = TradeDatum

tradeInstance :: Scripts.TypedValidator Trade
tradeInstance = Scripts.mkTypedValidator @Trade
    ($$(PlutusTx.compile [|| tradeValidate ||]) `PlutusTx.applyCode` PlutusTx.liftCode contractInfo)
    $$(PlutusTx.compile [|| wrap ||])
  where
    wrap = Scripts.wrapValidator @TradeDatum @TradeAction

tradeValidator :: Validator
tradeValidator = Scripts.validatorScript tradeInstance


tradeAddress :: Ledger.Address
tradeAddress = scriptAddress tradeValidator

-- Types

PlutusTx.makeIsDataIndexed ''ContractInfo [('ContractInfo , 0)]
PlutusTx.makeLift ''ContractInfo

PlutusTx.makeIsDataIndexed ''TradeDetails [ ('TradeDetails, 0)]
PlutusTx.makeLift ''TradeDetails

PlutusTx.makeIsDataIndexed ''TradeDatum [ ('StartBid, 0)
                                        , ('Bid,   1)
                                        , ('Offer, 2)
                                        ]
PlutusTx.makeLift ''TradeDatum

PlutusTx.makeIsDataIndexed ''TradeAction [ ('Buy,       0)
                                         , ('Sell,      1)
                                         , ('BidHigher, 2)
                                         , ('Cancel,    3)
                                        ]
PlutusTx.makeLift ''TradeAction



-- Off-Chain


-- helper functions

containsSpaceBudNFT :: Value -> BuiltinByteString -> Bool
containsSpaceBudNFT v tn = valueOf v (policySpaceBudz contractInfo) (TokenName ((prefixSpaceBud contractInfo) <> tn)) >= 1

containsPolicyBidNFT :: Value -> BuiltinByteString -> Bool
containsPolicyBidNFT v tn = valueOf v (policyBid contractInfo) (TokenName ((prefixSpaceBudBid contractInfo) <> tn)) >= 1

policyAssets :: Value -> CurrencySymbol -> [(CurrencySymbol, TokenName, Integer)]
policyAssets v cs = P.filter (\(cs',_,am) -> cs == cs' && am == 1) (flattenValue v)

policyBidLength :: Value -> Integer
policyBidLength v = length $ policyAssets v (policyBid contractInfo)

policyBidRemaining :: Value -> TokenName -> Value
policyBidRemaining v tn = convert (P.filter (\(cs',tn',am) -> (policyBid contractInfo) == cs' && am == 1 && tn /= tn' ) (flattenValue v))
    where convert [] = mempty
          convert ((cs,tn,am):t) = Value.singleton cs tn am <> convert t

lovelacePercentage :: Integer -> Integer -> Integer
lovelacePercentage am p = (am * 10) `Haskell.div` p

data TradeParams = TradeParams
    { id :: !BuiltinByteString
    , amount :: !Integer
    } deriving (Generic, ToJSON, FromJSON, ToSchema)

type TradeSchema = Endpoint "offer" TradeParams
        .\/ Endpoint "buy" TradeParams
        .\/ Endpoint "cancelOffer" TradeParams
        .\/ Endpoint "cancelBid" TradeParams
        .\/ Endpoint "init" ()
        .\/ Endpoint "bid" TradeParams
        .\/ Endpoint "sell" TradeParams
        .\/ Endpoint "cancelBidAndBuy" TradeParams
        .\/ Endpoint "cancelOfferAndSell" TradeParams
        .\/ Endpoint "troll" TradeParams

trade :: AsContractError e => Contract () TradeSchema e ()
trade = selectList [init, offer, buy, cancelOffer, bid, sell, cancelBid, cancelBidAndBuy, cancelOfferAndSell, troll] >> trade

endpoints :: AsContractError e => Contract () TradeSchema e ()
endpoints = trade

-- init API endpoint is only used in the simulation for getting bid NFTs into circulation
init :: AsContractError e => Promise () TradeSchema e ()
init = endpoint @"init" @() $ \() -> do
    let tx = mustPayToTheScript StartBid (Value.singleton (policyBid contractInfo) (TokenName "SpaceBudBid0") 1 <> Value.singleton (policyBid contractInfo) (TokenName "SpaceBudBid1") 1 <> Value.singleton (policyBid contractInfo) (TokenName "SpaceBudBid2") 1) 
    void $ submitTxConstraints tradeInstance tx


-- this endpoint is just for the simulator to check if a bad actor could buy two SpaceBudz in a single transaction
troll :: AsContractError e => Promise () TradeSchema e ()
troll = endpoint @"troll" @TradeParams $ \(TradeParams{..}) -> do
    utxos <- utxoAt tradeAddress
    pkh <- pubKeyHash <$> Plutus.Contract.ownPubKey
    let offerUtxo0 = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Offer details) -> "0" == budId details && containsSpaceBudNFT (txOutValue $ txOutTxOut o) "0"; _ -> False]
    let offerUtxo1 = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Offer details) -> "1" == budId details && containsSpaceBudNFT (txOutValue $ txOutTxOut o) "1"; _ -> False]
    let offerUtxo0Map = let [(offeroref, offero, Offer offerdetails, offervalue)] = offerUtxo0 in  Map.fromList [(offeroref,offero)]
    let offerUtxo1Map = let [(offeroref, offero, Offer offerdetails, offervalue)] = offerUtxo1 in  Map.fromList [(offeroref,offero)]
    let [(offeroref, offero, Offer offerdetails, offervalue)] = offerUtxo0
    let (owner1PubKeyHash, owner1Fee1, owner1Fee2) = owner1 contractInfo
        (owner2PubKeyHash, owner2Fee1) = owner2 contractInfo
        lovelaceAmount = 500000000
    let (amount1, amount2, amount3) = (lovelacePercentage lovelaceAmount (owner1Fee2),lovelacePercentage lovelaceAmount (owner2Fee1),lovelacePercentage lovelaceAmount (extraRecipient contractInfo))
    
    let tx = collectFromScript offerUtxo0Map Buy <> 
                collectFromScript offerUtxo1Map Buy <> 
                mustPayToPubKey (owner1PubKeyHash) (Ada.lovelaceValueOf amount1) <>
                mustPayToPubKey (owner2PubKeyHash) (Ada.lovelaceValueOf amount2) <>
                mustPayToPubKey (pubKeyHash $ Emulator.walletPubKey (Emulator.Wallet 3)) (Ada.lovelaceValueOf amount3) <> -- arbitary address
                mustPayToPubKey (tradeOwner offerdetails) (Ada.lovelaceValueOf (lovelaceAmount - amount1 - amount2 - amount3)) <>
                mustPayToPubKey (pkh) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud0")) 1) <>
                mustPayToPubKey (pkh) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud1")) 1)
    void $ submitTxConstraintsSpending tradeInstance utxos tx


cancelBidAndBuy :: AsContractError e => Promise () TradeSchema e ()
cancelBidAndBuy = endpoint @"cancelBidAndBuy" @TradeParams $ \(TradeParams{..}) -> do
    utxos <- utxoAt tradeAddress
    pkh <- pubKeyHash <$> Plutus.Contract.ownPubKey
    let bidUtxo = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Bid details) -> id == budId details && containsPolicyBidNFT (txOutValue $ txOutTxOut o) id; _ -> False]
    case bidUtxo of
        [(bidoref, bido, Bid biddetails, bidvalue)] -> do
            let offerUtxo = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Offer details) -> id == budId details && containsSpaceBudNFT (txOutValue $ txOutTxOut o) id; _ -> False]
            case offerUtxo of
                [(offeroref, offero, Offer offerdetails, offervalue)] -> do
                    let (owner1PubKeyHash, owner1Fee1, owner1Fee2) = owner1 contractInfo
                        (owner2PubKeyHash, owner2Fee1) = owner2 contractInfo
                        lovelaceAmount = requestedAmount offerdetails
                    if lovelaceAmount >= 400000000 then do
                        let (amount1, amount2, amount3) = (lovelacePercentage lovelaceAmount (owner1Fee2),lovelacePercentage lovelaceAmount (owner2Fee1),lovelacePercentage lovelaceAmount (extraRecipient contractInfo))
                        let bidUtxoMap = Map.fromList [(bidoref,bido)]
                        let offerUtxoMap = Map.fromList [(offeroref,offero)]
                        let tx = collectFromScript bidUtxoMap Cancel <> 
                                collectFromScript offerUtxoMap Buy <> 
                                mustPayToPubKey (owner1PubKeyHash) (Ada.lovelaceValueOf amount1) <>
                                mustPayToPubKey (owner2PubKeyHash) (Ada.lovelaceValueOf amount2) <>
                                mustPayToPubKey (pubKeyHash $ Emulator.walletPubKey (Emulator.Wallet 3)) (Ada.lovelaceValueOf amount3) <> -- arbitary address
                                mustPayToPubKey (tradeOwner offerdetails) (Ada.lovelaceValueOf (lovelaceAmount - amount1 - amount2 - amount3)) <>
                                mustPayToPubKey (pkh) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud" <> id)) 1) <>
                                mustPayToTheScript StartBid (Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1)
                        void $ submitTxConstraintsSpending tradeInstance utxos tx
                    else do
                        let amount1 = lovelacePercentage lovelaceAmount (owner1Fee1)
                        let bidUtxoMap = Map.fromList [(bidoref,bido)]
                        let offerUtxoMap = Map.fromList [(offeroref,offero)]
                        let tx = collectFromScript bidUtxoMap Cancel <> 
                                collectFromScript offerUtxoMap Buy <> 
                                mustPayToPubKey (owner1PubKeyHash) (Ada.lovelaceValueOf amount1) <>
                                mustPayToPubKey (tradeOwner offerdetails) (Ada.lovelaceValueOf (lovelaceAmount - amount1)) <>
                                mustPayToPubKey (pkh) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud" <> id)) 1) <>
                                mustPayToTheScript StartBid (Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1)
                        void $ submitTxConstraintsSpending tradeInstance utxos tx
                _ -> traceError "expected only one output"
        _ -> traceError "expected only one output"

cancelOfferAndSell :: AsContractError e => Promise () TradeSchema e ()
cancelOfferAndSell = endpoint @"cancelOfferAndSell" @TradeParams $ \(TradeParams{..}) -> do
    utxos <- utxoAt tradeAddress
    pkh <- pubKeyHash <$> Plutus.Contract.ownPubKey
    let offerUtxo = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Offer details) -> id == budId details && containsSpaceBudNFT (txOutValue $ txOutTxOut o) id; _ -> False]
    case offerUtxo of
        [(offeroref, offero, Offer offerdetails, offervalue)] -> do
            let bidUtxo = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Bid details) -> id == budId details && containsPolicyBidNFT (txOutValue $ txOutTxOut o) id; _ -> False]
            case bidUtxo of
                [(bidoref, bido, Bid biddetails, bidvalue)] -> do
                    let (owner1PubKeyHash, owner1Fee1, owner1Fee2) = owner1 contractInfo
                        (owner2PubKeyHash, owner2Fee1) = owner2 contractInfo
                        lovelaceAmount = getLovelace $ Ada.fromValue bidvalue
                    if lovelaceAmount >= 400000000 then do
                        let (amount1, amount2, amount3) = (lovelacePercentage lovelaceAmount (owner1Fee2),lovelacePercentage lovelaceAmount (owner2Fee1),lovelacePercentage lovelaceAmount (extraRecipient contractInfo))
                            bidUtxoMap = Map.fromList [(bidoref,bido)]
                            offerUtxoMap = Map.fromList [(offeroref,offero)]
                            tx = collectFromScript bidUtxoMap Sell <> 
                                collectFromScript offerUtxoMap Cancel <>
                                mustPayToPubKey (owner1PubKeyHash) (Ada.lovelaceValueOf amount1) <>
                                mustPayToPubKey (owner2PubKeyHash) (Ada.lovelaceValueOf amount2) <>
                                mustPayToPubKey (pubKeyHash $ Emulator.walletPubKey (Emulator.Wallet 3)) (Ada.lovelaceValueOf amount3) <> -- arbitary address
                                mustPayToPubKey (pkh) (Ada.lovelaceValueOf (lovelaceAmount - amount1 - amount2 - amount3)) <>
                                mustPayToPubKey (tradeOwner biddetails) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud" <> id)) 1) <>
                                mustPayToTheScript StartBid (Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1)
                        void $ submitTxConstraintsSpending tradeInstance utxos tx
                    else do
                        let amount1 = lovelacePercentage lovelaceAmount (owner1Fee1)
                            bidUtxoMap = Map.fromList [(bidoref,bido)]
                            offerUtxoMap = Map.fromList [(offeroref,offero)]
                            tx = collectFromScript bidUtxoMap Sell <> 
                                collectFromScript offerUtxoMap Cancel <>
                                mustPayToPubKey (owner1PubKeyHash) (Ada.lovelaceValueOf amount1) <>
                                mustPayToPubKey (pkh) (Ada.lovelaceValueOf (lovelaceAmount - amount1)) <>
                                mustPayToPubKey (tradeOwner biddetails) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud" <> id)) 1) <>
                                mustPayToTheScript StartBid (Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1)
                        void $ submitTxConstraintsSpending tradeInstance utxos tx
                _ -> traceError "expected only one output"
        _ -> traceError "expected only one output"

bid :: AsContractError e => Promise () TradeSchema e ()
bid = endpoint @"bid" @TradeParams $ \(TradeParams{..}) -> do
    utxos <- utxoAt tradeAddress
    pkh <- pubKeyHash <$> Plutus.Contract.ownPubKey
    let bidUtxo = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (StartBid) -> containsPolicyBidNFT (txOutValue $ txOutTxOut o) id; (Bid details) -> budId details == id && containsPolicyBidNFT (txOutValue $ txOutTxOut o) id; _ -> False]
    let bidDatum = Bid TradeDetails {budId = id, requestedAmount = 1, tradeOwner = pkh}
    case bidUtxo of
        [(oref, o, StartBid, value)] -> do
            if amount < minPrice contractInfo then traceError "amount too small" else if policyBidLength value > 1 then do
                let utxoMap = Map.fromList [(oref,o)]
                    tx = collectFromScript utxoMap BidHigher <> 
                        mustPayToTheScript bidDatum (Ada.lovelaceValueOf (amount) <> Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1) <>
                        mustPayToTheScript StartBid (policyBidRemaining value (TokenName ("SpaceBudBid" <> id)))
                void $ submitTxConstraintsSpending tradeInstance utxos tx
            else do
                let utxoMap = Map.fromList [(oref,o)]
                    tx = collectFromScript utxoMap BidHigher <> 
                        mustPayToTheScript bidDatum (Ada.lovelaceValueOf (amount) <> Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1)
                void $ submitTxConstraintsSpending tradeInstance utxos tx
        [(oref, o, Bid details, value)] -> do
            if amount < bidStep contractInfo + getLovelace (Ada.fromValue value) then traceError "amount too small" else do
                let utxoMap = Map.fromList [(oref,o)]
                    tx = collectFromScript utxoMap BidHigher <> 
                        mustPayToTheScript bidDatum (Ada.lovelaceValueOf (amount) <> Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1) <>
                        case (tradeOwner details == pkh) of True -> mempty; False -> mustPayToPubKey (tradeOwner details) (Ada.toValue (Ada.fromValue value))
                void $ submitTxConstraintsSpending tradeInstance utxos tx
        _ -> traceError "expected only one output"


sell :: AsContractError e => Promise () TradeSchema e ()
sell = endpoint @"sell" @TradeParams $ \(TradeParams{..}) -> do
    utxos <- utxoAt tradeAddress
    pkh <- pubKeyHash <$> Plutus.Contract.ownPubKey
    let bidUtxo = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Bid details) -> id == budId details && containsPolicyBidNFT (txOutValue $ txOutTxOut o) id; _ -> False]
    case bidUtxo of
        [(oref, o, Bid details, value)] -> do
            let (owner1PubKeyHash, owner1Fee1, owner1Fee2) = owner1 contractInfo
                (owner2PubKeyHash, owner2Fee1) = owner2 contractInfo
                lovelaceAmount = getLovelace $ Ada.fromValue value
            if lovelaceAmount >= 400000000 then do
                let (amount1, amount2, amount3) = (lovelacePercentage lovelaceAmount (owner1Fee2),lovelacePercentage lovelaceAmount (owner2Fee1),lovelacePercentage lovelaceAmount (extraRecipient contractInfo))
                    utxoMap = Map.fromList [(oref,o)]
                    tx = collectFromScript utxoMap Sell <> 
                        mustPayToPubKey (owner1PubKeyHash) (Ada.lovelaceValueOf amount1) <>
                        mustPayToPubKey (owner2PubKeyHash) (Ada.lovelaceValueOf amount2) <>
                        mustPayToPubKey (pubKeyHash $ Emulator.walletPubKey (Emulator.Wallet 3)) (Ada.lovelaceValueOf amount3) <> -- arbitary address
                        mustPayToPubKey (pkh) (Ada.lovelaceValueOf (lovelaceAmount - amount1 - amount2 - amount3)) <>
                        mustPayToPubKey (tradeOwner details) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud" <> id)) 1) <>
                        mustPayToTheScript StartBid (Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1)
                void $ submitTxConstraintsSpending tradeInstance utxos tx
            else do
                let amount1 = lovelacePercentage lovelaceAmount (owner1Fee1)
                    utxoMap = Map.fromList [(oref,o)]
                    tx = collectFromScript utxoMap Sell <> 
                        mustPayToPubKey (owner1PubKeyHash) (Ada.lovelaceValueOf amount1) <>
                        mustPayToPubKey (pkh) (Ada.lovelaceValueOf (lovelaceAmount - amount1)) <>
                        mustPayToPubKey (tradeOwner details) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud" <> id)) 1) <>
                        mustPayToTheScript StartBid (Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1)
                void $ submitTxConstraintsSpending tradeInstance utxos tx
        _ -> traceError "expected only one output"


offer :: AsContractError e => Promise () TradeSchema e ()
offer = endpoint @"offer" @TradeParams $ \(TradeParams{..}) -> do
    if amount < minPrice contractInfo then traceError "amount too small" else do
        pkh <- pubKeyHash <$> Plutus.Contract.ownPubKey
        let tradeDatum = Offer TradeDetails {budId = id, requestedAmount = amount, tradeOwner = pkh}
            tx = mustPayToTheScript tradeDatum (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud" <> id)) 1)
        void $ submitTxConstraints tradeInstance tx


buy :: AsContractError e => Promise () TradeSchema e ()
buy = endpoint @"buy" @TradeParams $ \(TradeParams{..}) -> do
    utxos <- utxoAt tradeAddress
    pkh <- pubKeyHash <$> Plutus.Contract.ownPubKey
    let offerUtxo = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Offer details) -> id == budId details && containsSpaceBudNFT (txOutValue $ txOutTxOut o) id; _ -> False]
    case offerUtxo of
        [(oref, o, Offer details, value)] -> do
            let (owner1PubKeyHash, owner1Fee1, owner1Fee2) = owner1 contractInfo
                (owner2PubKeyHash, owner2Fee1) = owner2 contractInfo
                lovelaceAmount = requestedAmount details
            if lovelaceAmount >= 400000000 then do
                let (amount1, amount2, amount3) = (lovelacePercentage lovelaceAmount (owner1Fee2),lovelacePercentage lovelaceAmount (owner2Fee1),lovelacePercentage lovelaceAmount (extraRecipient contractInfo))
                let utxoMap = Map.fromList [(oref,o)]
                let tx = collectFromScript utxoMap Buy <> 
                        mustPayToPubKey (owner1PubKeyHash) (Ada.lovelaceValueOf amount1) <>
                        mustPayToPubKey (owner2PubKeyHash) (Ada.lovelaceValueOf amount2) <>
                        mustPayToPubKey (pubKeyHash $ Emulator.walletPubKey (Emulator.Wallet 3)) (Ada.lovelaceValueOf amount3) <> -- arbitary address
                        mustPayToPubKey (tradeOwner details) (Ada.lovelaceValueOf (lovelaceAmount - amount1 - amount2 - amount3)) <>
                        mustPayToPubKey (pkh) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud" <> id)) 1)
                void $ submitTxConstraintsSpending tradeInstance utxos tx
            else do
                let amount1 = lovelacePercentage lovelaceAmount (owner1Fee1)
                let utxoMap = Map.fromList [(oref,o)]
                let tx = collectFromScript utxoMap Buy <> 
                        mustPayToPubKey (owner1PubKeyHash) (Ada.lovelaceValueOf amount1) <>
                        mustPayToPubKey (tradeOwner details) (Ada.lovelaceValueOf (lovelaceAmount - amount1)) <>
                        mustPayToPubKey (pkh) (Value.singleton (policySpaceBudz contractInfo) (TokenName ("SpaceBud" <> id)) 1)
                void $ submitTxConstraintsSpending tradeInstance utxos tx
        _ -> traceError "expected only one output"


cancelOffer :: AsContractError e => Promise () TradeSchema e ()
cancelOffer = endpoint @"cancelOffer" @TradeParams $ \(TradeParams{..}) -> do
    utxos <- utxoAt tradeAddress
    pkh <- pubKeyHash <$> Plutus.Contract.ownPubKey
    let offerUtxo = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Offer details) -> id == budId details && containsSpaceBudNFT (txOutValue $ txOutTxOut o) id; _ -> False]
    case offerUtxo of
        [(oref, o, Offer details, value)] -> do
            let utxoMap = Map.fromList [(oref,o)]
                tx = collectFromScript utxoMap (Cancel) <> 
                    mustPayToPubKey (pkh) value
            void $ submitTxConstraintsSpending tradeInstance utxos tx
        _ -> traceError "expected only one output"

cancelBid :: AsContractError e => Promise () TradeSchema e ()
cancelBid = endpoint @"cancelBid" @TradeParams $ \(TradeParams{..}) -> do
    utxos <- utxoAt tradeAddress
    pkh <- pubKeyHash <$> Plutus.Contract.ownPubKey
    let bidUtxo = [ (oref, o, getTradeDatum o, txOutValue $ txOutTxOut o) | (oref, o) <- Map.toList utxos, case getTradeDatum o of (Bid details) -> id == budId details && containsPolicyBidNFT (txOutValue $ txOutTxOut o) id; _ -> False]
    case bidUtxo of
        [(oref, o, Bid details, value)] -> do
            let utxoMap = Map.fromList [(oref,o)]
                tx = collectFromScript utxoMap (Cancel) <> 
                    mustPayToPubKey (tradeOwner details) (Ada.toValue (Ada.fromValue value)) <>
                    mustPayToTheScript StartBid (Value.singleton (policyBid contractInfo) (TokenName ("SpaceBudBid" <> id)) 1)
            void $ submitTxConstraintsSpending tradeInstance utxos tx
        _ -> traceError "expected only one output"

getTradeDatum :: TxOutTx -> TradeDatum
getTradeDatum o = case txOutDatum (txOutTxOut o) of
    Just h -> do
        let [(_,datum)] = P.filter (\(h',_) -> h == h') (Map.toList (txData (txOutTxTx o)))
        let parsedDatum = PlutusTx.fromBuiltinData (getDatum datum) :: Maybe TradeDatum
        case parsedDatum of
            Just b -> b
            _ -> traceError "expected datum"
    _ -> traceError "expected datum"



mkSchemaDefinitions ''TradeSchema
spacebud0 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBud0" :| [])
spacebud1 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBud1" :| [])
spacebud2 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBud2" :| [])

spacebudBid0 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBudBid0" :| [])
spacebudBid1 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBudBid1" :| [])
spacebudBid2 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBudBid2" :| [])


mkKnownCurrencies ['spacebud0,'spacebud1, 'spacebud2, 'spacebudBid0,'spacebudBid1,'spacebudBid2]

-- Serialization

{-
    As a Script
-}

tradeScript :: Plutus.Script
tradeScript = Plutus.unValidatorScript tradeValidator

{-
    As a Short Byte String
-}

tradeSBS :: SBS.ShortByteString
tradeSBS =  SBS.toShort . LBS.toStrict $ serialise tradeScript

{-
    As a Serialised Script
-}

tradeSerialised :: PlutusScript PlutusScriptV1
tradeSerialised = PlutusScriptSerialised tradeSBS