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

module Cardano.PlutusExample.Trade
  ( tradeSerialised
  , tradeSBS
  ) where
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

-- Total Fee: 2.5%

-- Owner1 Fee: 1.95%
-- Owner2 Fee: 0.5%
-- Hosting Provider Fee: 0.05%

data ContractInfo = ContractInfo
    { policySpaceBudz :: !CurrencySymbol
    , policyBid :: !CurrencySymbol
    , owner1 :: !(PubKeyHash, Integer, Integer, Integer)
    , owner2 :: !(PubKeyHash, Integer)
    , extraRecipient :: !Integer
    , minPrice :: !Integer
    , bidStep :: !Integer
    } deriving (Generic, ToJSON, FromJSON)

toFraction :: Float -> Integer
toFraction p = toInteger $ floor (1 / (p / 1000))


contractInfo = ContractInfo 
    { policySpaceBudz = "21fe31dfa154a261626bf854046fd2271b7bed4b6abe45aa58877ef47f9721b9"
    , policyBid = "21fe31dfa154a261626bf854046fd2271b7bed4b6abe45aa58877ef47f9721b9"
    , owner1 = ("21fe31dfa154a261626bf854046fd2271b7bed4b6abe45aa58877ef47f9721b9", toFraction 1.95, toFraction 2, toFraction 2.5)
    , owner2 = ("21fe31dfa154a261626bf854046fd2271b7bed4b6abe45aa58877ef47f9721b9", toFraction 0.5)
    , extraRecipient = toFraction 0.05
    , minPrice = 50000000
    , bidStep = 10000
    }

-- Data and Redeemers

data TradeDetails = TradeDetails
    { tradeOwner :: !PubKeyHash
    , budId :: !TokenName
    , requestedAmount :: !Integer
    } deriving (Generic, ToJSON, FromJSON)

instance Eq TradeDetails where
    {-# INLINABLE (==) #-}
    -- tradeOwner is not compared, since tradeOwner changes with each trade/higher bid
    a == b = (budId  a == budId  b) &&
             (requestedAmount a == requestedAmount b)

data TradeDatum = StartBid | Bid TradeDetails | Offer TradeDetails 
    deriving (Generic, ToJSON, FromJSON)

instance Eq TradeDatum where
    {-# INLINABLE (==) #-}
    StartBid == StartBid = True
    Bid a == Bid b = a == b
    Offer a == Offer b = a == b

data TradeAction = Buy | Sell | BidHigher | Cancel
    deriving (Generic, ToJSON, FromJSON)


instance Semigroup TokenName where
    {-# INLINABLE (<>) #-}
    TokenName a <> TokenName b = TokenName (a <> b)

-- Validator

{-# INLINABLE tradeValidate #-}
tradeValidate :: ContractInfo -> TradeDatum -> TradeAction -> ScriptContext -> Bool
tradeValidate contractInfo tradeDatum tradeAction context = case tradeDatum of
    StartBid -> case tradeAction of
        BidHigher -> correctStartBidOutputs

    Bid details -> case tradeAction of
        BidHigher -> 
            traceIfFalse "expected correct script output datum" (Bid details == scriptOutputDatum) &&
            traceIfFalse "expected correct bid amount" (Ada.fromValue (scriptInputValue) + Ada.lovelaceOf (bidStep contractInfo) <= Ada.fromValue scriptOutputValue) &&
            traceIfFalse "expected correct bidPolicy NFT" (containsPolicyBidNFT scriptOutputValue (budId details)) &&
            traceIfFalse "expected previous bidder refund" (Ada.fromValue (valuePaidTo txInfo (tradeOwner details)) >= Ada.fromValue scriptInputValue)
        Sell -> 
            traceIfFalse "expected correct script output datum" (scriptOutputDatum == StartBid) &&
            traceIfFalse "expected correct bidPolicy NFT" (containsPolicyBidNFT scriptOutputValue (budId details)) &&
            traceIfFalse "expected bidder to be paid" (containsSpaceBudNFT (valuePaidTo txInfo (tradeOwner details)) (budId details)) &&
            traceIfFalse "expected ada to be split correctly" (correctSplit signer)
        Cancel -> 
            traceIfFalse "expected correct owner" (txInfo `txSignedBy` tradeOwner details) &&
            traceIfFalse "expected correct script output datum" (scriptOutputDatum == StartBid) &&
            traceIfFalse "expected correct bidPolicy NFT" (containsPolicyBidNFT scriptOutputValue (budId details)) &&
            traceIfFalse "expect correct refund" (Ada.fromValue (valuePaidTo txInfo (tradeOwner details)) >= Ada.fromValue scriptInputValue)

    Offer details -> case tradeAction of
        Buy ->
            traceIfFalse "expected bidder to be paid" (containsSpaceBudNFT (valuePaidTo txInfo signer) (budId details)) &&
            traceIfFalse "expected ada to be split correctly" (correctSplit (tradeOwner details))
        Cancel -> 
            traceIfFalse "expected correct owner" (txInfo `txSignedBy` tradeOwner details) &&
            traceIfFalse "expect correct refund" (containsSpaceBudNFT (valuePaidTo txInfo (tradeOwner details)) (budId details))

    where
        txInfo :: TxInfo
        txInfo = scriptContextTxInfo context

        prefixSpaceBud :: BuiltinByteString
        prefixSpaceBudBid :: BuiltinByteString
        (prefixSpaceBud,prefixSpaceBudBid)  = ("SpaceBud", "SpaceBudBid")

        policyAssets :: Value -> CurrencySymbol -> [(CurrencySymbol, TokenName, Integer)]
        policyAssets v cs = P.filter (\(cs',_,am) -> cs == cs' && am == 1) (flattenValue v)

        signer :: PubKeyHash
        signer = case txInfoSignatories txInfo of
            [pubKey] -> pubKey
            _ -> traceError "too many signers involved"


        (owner1PubKeyHash, owner1Fee1, owner1Fee2, owner1Fee3) = owner1 contractInfo
        (owner2PubKeyHash, owner2Fee1) = owner2 contractInfo

        -- minADA requirement forces the contract to give up certain fee recipients
        correctSplit :: PubKeyHash -> Bool
        correctSplit tradeRecipient
            | lovelaceAmount > 3000000000 = let (amount1, amount2, amount3) = (lovelacePercentage lovelaceAmount (owner1Fee1),lovelacePercentage lovelaceAmount (owner2Fee1),lovelacePercentage lovelaceAmount (extraRecipient contractInfo)) 
                in 
                  traceIfFalse "expected owner1 to receive right amount" (Ada.fromValue (valuePaidTo txInfo owner1PubKeyHash) >= Ada.lovelaceOf amount1) &&
                  traceIfFalse "expected owner2 to receive right amount" (Ada.fromValue (valuePaidTo txInfo owner2PubKeyHash) >= Ada.lovelaceOf amount2) &&
                  traceIfFalse "expected trade recipient to receive right amount" (Ada.fromValue (valuePaidTo txInfo tradeRecipient) >= Ada.lovelaceOf (lovelaceAmount - amount1 - amount2 - amount3))
            | lovelaceAmount > 600000000 = let (amount1, amount2) = (lovelacePercentage lovelaceAmount (owner1Fee2),lovelacePercentage lovelaceAmount (owner2Fee1))
                in 
                  traceIfFalse "expected owner1 to receive right amount" (Ada.fromValue (valuePaidTo txInfo owner1PubKeyHash) >= Ada.lovelaceOf amount1) &&
                  traceIfFalse "expected owner2 to receive right amount" (Ada.fromValue (valuePaidTo txInfo owner2PubKeyHash) >= Ada.lovelaceOf amount2) &&
                  traceIfFalse "expected trade recipient to receive right amount" (Ada.fromValue (valuePaidTo txInfo tradeRecipient) >= Ada.lovelaceOf (lovelaceAmount - amount1 - amount2))
            | otherwise = let amount1 = lovelacePercentage lovelaceAmount (owner1Fee3)
                in 
                  traceIfFalse "expected owner1 to receive right amount" (Ada.fromValue (valuePaidTo txInfo owner1PubKeyHash) >= Ada.lovelaceOf amount1) &&
                  traceIfFalse "expected trade recipient to receive right amount" (Ada.fromValue (valuePaidTo txInfo tradeRecipient) >= Ada.lovelaceOf (lovelaceAmount - amount1))
            where
              lovelaceAmount = getLovelace (Ada.fromValue scriptInputValue)
          
        lovelacePercentage :: Integer -> Integer -> Integer
        lovelacePercentage am p = (am * 10) `divide` p


        outputInfo :: TxOut -> (Value, TradeDatum)
        outputInfo o = case txOutAddress o of
            Address (ScriptCredential _) _  -> case txOutDatumHash o of
                Nothing -> traceError "datum hash not found"
                Just h -> case findDatum h txInfo of
                    Nothing -> traceError "datum not found"
                    Just (Datum d) ->  case PlutusTx.fromBuiltinData d of
                        Just b -> (txOutValue o, b)
                        Nothing  -> traceError "error decoding data"
            _ -> traceError "wrong output type"

        policyBidLength :: Value -> Integer
        policyBidLength v = length $ policyAssets v (policyBid contractInfo)

        containsPolicyBidNFT :: Value -> TokenName -> Bool
        containsPolicyBidNFT v tn = valueOf v (policyBid contractInfo) (TokenName prefixSpaceBudBid <> tn) == 1

        containsSpaceBudNFT :: Value -> TokenName -> Bool
        containsSpaceBudNFT v tn = valueOf v (policySpaceBudz contractInfo) (TokenName prefixSpaceBud <> tn) == 1

        containsAdaAmount :: Value -> Integer -> Bool
        containsAdaAmount v n = getLovelace (Ada.fromValue v) == n

        scriptInputValue :: Value
        scriptInputValue =
            let
                isScriptInput i = case txOutAddress (txInInfoResolved i) of
                    Address (ScriptCredential _) _ -> True
                    _ -> False
                xs = [i | i <- txInfoInputs txInfo, isScriptInput i]
            in
                case xs of
                    [i] -> txOutValue (txInInfoResolved i)
                    _ -> traceError "expected exactly one script input"
            

        scriptOutputValue :: Value
        scriptOutputDatum :: TradeDatum
        (scriptOutputValue, scriptOutputDatum) = case getContinuingOutputs context of
            [o] -> outputInfo o
            _ -> traceError "expected exactly one continuing output"

        -- 2 outputs possible because of distribution of inital bid NFT tokens and only applies if datum is StartBid
        correctStartBidOutputs :: Bool
        correctStartBidOutputs = if policyBidLength scriptInputValue > 1 
            then 
                case getContinuingOutputs context of
                    [o1, o2] -> let (info1, info2) = (outputInfo o1, outputInfo o2) in
                                case info1 of
                                    (v1, StartBid) -> 
                                        traceIfFalse "expected correct policyBid NFTs amount in output" (policyBidLength scriptInputValue - 1 == policyBidLength v1) &&
                                        case info2 of
                                            (v2, Bid details) ->
                                                traceIfFalse "expected policyBid NFT in output" (containsPolicyBidNFT v2 (budId details)) &&
                                                traceIfFalse "expected at least minPrice bid" (containsAdaAmount v2 (minPrice contractInfo)) &&
                                                traceIfFalse "expeced correct output datum amount" (requestedAmount details == 1)
                                            _ -> traceError "not possible state transition"
                                    (v1, Bid details) -> 
                                        traceIfFalse "expected policyBid NFT in output" (containsPolicyBidNFT v1 (budId details)) &&
                                        traceIfFalse "expected at least minPrice bid" (containsAdaAmount v1 (minPrice contractInfo)) &&
                                        traceIfFalse "expeced correct output datum amount" (requestedAmount details == 1) &&
                                        case info2 of
                                            (v2, StartBid) -> 
                                                traceIfFalse "expect correct policyBid NFTs amount in output" (policyBidLength scriptInputValue - 1 == policyBidLength v2)
                                            _ -> traceError "not possible state transition"
                                    _ -> traceError "not a valid datum"
                    _ -> traceError "expected exactly two continuing output"
            else
                case getContinuingOutputs context of
                    [o] -> let (value, datum) = outputInfo o in case datum of
                            (Bid details) ->
                                traceIfFalse "expected policyBid NFT in output" (containsPolicyBidNFT value (budId details)) &&
                                traceIfFalse "expected at least minPrice bid" (containsAdaAmount value (minPrice contractInfo)) &&
                                traceIfFalse "expeced correct output datum amount" (requestedAmount details == 1)
                            _ -> traceError "not possible state transition"
                    _ -> traceError "expected exactly one continuing output"

        

      
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


