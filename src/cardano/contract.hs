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


import           Control.Monad        hiding (fmap)
import           Data.Aeson           (ToJSON, FromJSON)
import           Data.List.NonEmpty   (NonEmpty (..))
import           Data.Map             as Map
import           Data.Text            (pack, Text)
import           GHC.Generics         (Generic)
import           Plutus.Contract      hiding (when)
import qualified PlutusTx             as PlutusTx
import           PlutusTx.Prelude     hiding (Semigroup(..), unless)
import qualified PlutusTx.Prelude     as Plutus
import           Ledger               hiding (singleton)
import           Ledger.Credential (Credential (..))
import           Ledger.Constraints   as Constraints
import qualified Ledger.Scripts       as Scripts
import qualified Ledger.Typed.Scripts as Scripts
import           Ledger.Value         as Value
import           Ledger.Ada           as Ada
import           Playground.Contract  (ensureKnownCurrencies, printSchemas, stage, printJson)
import           Playground.TH        (mkKnownCurrencies, mkSchemaDefinitions)
import           Playground.Types     (KnownCurrency (..))
import           Prelude              (Semigroup (..))
import           Schema               (ToSchema)
import           Text.Printf          (printf)
import qualified PlutusTx.AssocMap       as AssocMap

-- contract

data ContractInfo = ContractInfo
    { policy   :: !CurrencySymbol
    , chargingFee :: !Integer
    , owner :: !PubKeyHash
    , minPrice :: !Integer
    } deriving (Show, Generic, ToJSON, FromJSON, ToSchema)


PlutusTx.unstableMakeIsData ''ContractInfo
PlutusTx.makeLift ''ContractInfo

toFraction :: Float -> Integer
toFraction p = toInteger $ floor (1/(p/100))


contractInfo = ContractInfo {policy = "66", chargingFee = toFraction 2.5, owner = "21fe31dfa154a261626bf854046fd2271b7bed4b6abe45aa58877ef47f9721b9", minPrice = 4}

-- make Data

data BidDatum = BidDatum
    { bdOwner   :: !PubKeyHash
    , bdRequest :: !Value
    } deriving (Show, Generic, ToJSON, FromJSON, ToSchema)

instance Eq BidDatum where
    {-# INLINABLE (==) #-}
    a == b = (bdOwner   a == bdOwner   b) &&
             (bdRequest a == bdRequest b)

PlutusTx.unstableMakeIsData ''BidDatum
PlutusTx.makeLift ''BidDatum

data OfferDatum = OfferDatum
    { odOwner   :: !PubKeyHash
    , odRequest :: !Integer
    } deriving (Show, Generic, ToJSON, FromJSON, ToSchema)

instance Eq OfferDatum where
    {-# INLINABLE (==) #-}
    a == b = (odOwner   a == odOwner   b) &&
             (odRequest   a == odRequest b)

PlutusTx.unstableMakeIsData ''OfferDatum
PlutusTx.makeLift ''OfferDatum

data TradingDatum = MkBid BidDatum | MkOffer OfferDatum | MkCharge
    deriving Show

instance Eq TradingDatum where
    {-# INLINABLE (==) #-}
    MkCharge == MkCharge = True
    MkBid a == MkBid b = a == b
    MkOffer a == MkOffer b = a == b

PlutusTx.unstableMakeIsData ''TradingDatum
PlutusTx.makeLift ''TradingDatum


data TradingAction = Buy BidDatum | Sell OfferDatum | BidHigher BidDatum | Cancel | Withdraw
    deriving Show

PlutusTx.unstableMakeIsData ''TradingAction
PlutusTx.makeLift ''TradingAction


-- make validator
{-# INLINABLE mkValidator #-}
mkValidator :: ContractInfo -> TradingDatum -> TradingAction -> ScriptContext -> Bool
mkValidator ci td ta ctx = case td of
    MkBid bid -> case ta of
        Cancel ->  info `txSignedBy` bdOwner bid
        BidHigher higherBid ->
            traceIfFalse "expected only SpaceBudz policy" (correctPolicy (bdRequest higherBid)) &&
            traceIfFalse "expected same bid request" (bdRequest bid == bdRequest higherBid) &&
            traceIfFalse "expected higher bid" (Ada.fromValue outVal > Ada.fromValue inVal) &&
            traceIfFalse "expected correct script output datum" (let (MkBid b) = outDatum in b == higherBid) &&
            traceIfFalse "expected refund" (valuePaidTo info (bdOwner bid) == inVal)
        Sell offer ->
            traceIfFalse "expected only SpaceBudz policy" (correctPolicy (bdRequest bid)) &&
            traceIfFalse "expected minPrice at least" (getLovelace (Ada.fromValue inVal) >= minPrice ci) &&
            traceIfFalse "expected correct value paid to bidder" (valuePaidTo info (bdOwner bid) == bdRequest bid) &&
            traceIfFalse "expected correct request value for seller" (Ada.lovelaceValueOf (odRequest offer) == inVal) &&
            traceIfFalse "expected charging script output datum" (outDatum == MkCharge) &&
            traceIfFalse "expected correct charge paid" (outVal == let am = getLovelace (Ada.fromValue inVal) in Ada.lovelaceValueOf (Plutus.divide am (chargingFee ci)))

    MkOffer offer -> case ta of
        Cancel -> info `txSignedBy` odOwner offer
        Buy bid -> traceIfFalse "expected only SpaceBudz policy" (correctPolicy inVal) &&
                   traceIfFalse "expected minPrice at least" (odRequest offer >= minPrice ci) &&
                   traceIfFalse "expected correct value paid to seller" (valuePaidTo info (odOwner offer) == Ada.lovelaceValueOf (odRequest offer - Plutus.divide (odRequest offer) (chargingFee ci))) &&
                   traceIfFalse "expected correct request value for bidder" (bdRequest bid == inVal) &&
                   traceIfFalse "expected charging script output datum" (outDatum == MkCharge) &&
                   traceIfFalse "expected correct charge paid" (outVal == Ada.lovelaceValueOf (Plutus.divide (odRequest offer) (chargingFee ci)))

    MkCharge -> case ta of
        Withdraw -> info `txSignedBy` owner ci


    where
        correctPolicy :: Value -> Bool
        correctPolicy v = case symbols v of 
            [cs] -> cs == policy ci
            _   -> False


        info :: TxInfo
        info = scriptContextTxInfo ctx

        inVal :: Value
        inVal =
            let
                isScriptInput i = case txOutAddress (txInInfoResolved i) of
                    Address (ScriptCredential _) _ -> True
                    _  -> False
                xs = [i | i <- txInfoInputs info, isScriptInput i]
            in
                case xs of
                    [i] -> txOutValue (txInInfoResolved i)
                    _   -> traceError "expected exactly one script input"

        outVal :: Value
        outDatum :: TradingDatum
        (outVal, outDatum) = case getContinuingOutputs ctx of
            [o] -> case txOutAddress o of
                Address (ScriptCredential _) _  -> case txOutDatumHash o of
                    Nothing -> traceError "datum hash not found"
                    Just h -> case findDatum h info of
                        Nothing -> traceError "datum not found"
                        Just (Datum d) ->  case PlutusTx.fromData d of
                            Just b -> (txOutValue o, b)
                            Nothing  -> traceError "error decoding data"
                _   -> traceError "wrong output type"
            _ -> traceError "expected exactly one continuing output"

       


      
data Trading
instance Scripts.ScriptType Trading where
    type instance RedeemerType Trading = TradingAction
    type instance DatumType Trading = TradingDatum

tradingInstance :: Scripts.ScriptInstance Trading
tradingInstance = Scripts.validator @Trading
    ($$(PlutusTx.compile [|| mkValidator ||]) `PlutusTx.applyCode` PlutusTx.liftCode contractInfo)
    $$(PlutusTx.compile [|| wrap ||])
  where
    wrap = Scripts.wrapValidator @TradingDatum @TradingAction

tradingValidator :: Validator
tradingValidator = Scripts.validatorScript tradingInstance


tradingAddress :: Ledger.Address
tradingAddress = scriptAddress tradingValidator

-- make API

setBid :: forall w s. HasBlockchainActions s => BidParams -> Contract w s Text ()
setBid BidParams{..} = do
    utxos <- utxoAt tradingAddress
    pkh <- pubKeyHash <$> ownPubKey
    let bpRequestValue = listToValue bpRequest
        b = MkBid $ BidDatum {bdOwner = pkh, bdRequest = bpRequestValue}
        openBid = [ (oref, o) | (oref, o) <- Map.toList utxos, hasActiveBid o bpRequestValue]
    case openBid of
        [(oref,o)] -> do
                        (BidDatum{..},v) <- getActiveBid o
                        let lookups = Constraints.scriptInstanceLookups tradingInstance <>
                                        Constraints.otherScript tradingValidator          <>
                                        Constraints.unspentOutputs (Map.singleton oref o)
                            tx = mustPayToTheScript b (Ada.lovelaceValueOf bpBid)   <>
                                 mustPayToPubKey bdOwner v     <>
                                 mustSpendScriptOutput oref (Redeemer $ PlutusTx.toData (BidHigher (let (MkBid higherBid) = b in higherBid)))
                        void $ submitTxConstraintsWith lookups tx
        _ -> do
                let tx = mustPayToTheScript b (Ada.lovelaceValueOf bpBid)
                void $ submitTxConstraints tradingInstance tx

sell :: forall w s. HasBlockchainActions s => OfferParams -> Contract w s Text ()
sell OfferParams{..} = do
    utxos <- utxoAt tradingAddress
    pkh <- pubKeyHash <$> ownPubKey
    let opOfferValue = listToValue opOffer
        offer = OfferDatum {odOwner = pkh, odRequest = opRequest}
        openBid = [ (oref, o) | (oref, o) <- Map.toList utxos, hasActiveBid o opOfferValue]
    logInfo @String (show openBid)
    case openBid of 
        [(oref,o)] -> do
                        (BidDatum{..},v) <- getActiveBid o
                        if v == Ada.lovelaceValueOf opRequest then do
                            let adminAmount = let am = getLovelace (Ada.fromValue v) in Ada.lovelaceValueOf (am `div` chargingFee contractInfo)
                                lookups = Constraints.scriptInstanceLookups tradingInstance <>
                                            Constraints.otherScript tradingValidator          <>
                                            Constraints.unspentOutputs (Map.singleton oref o)
                                tx =    mustPayToPubKey bdOwner opOfferValue <>
                                        mustPayToTheScript MkCharge adminAmount <>
                                        mustSpendScriptOutput oref (Redeemer $ PlutusTx.toData (Sell offer))
                            void $ submitTxConstraintsWith lookups tx
                        else throwError "amount insufficient"
        _ -> throwError "utxo invalid"

buy :: forall w s. HasBlockchainActions s => BidParams -> Contract w s Text ()
buy BidParams{..} = do
    utxos <- utxoAt tradingAddress
    pkh <- pubKeyHash <$> ownPubKey
    let bpRequestValue = listToValue bpRequest
        bid = BidDatum {bdOwner = pkh, bdRequest = bpRequestValue}
        openOffer = [ (oref, o) | (oref, o) <- Map.toList utxos, hasActiveOffer o bpRequestValue]
    case openOffer of 
        [(oref,o)] -> do
                        (OfferDatum{..},_) <- getActiveOffer o
                        let (receiverAmount, adminAmount) = (Ada.lovelaceValueOf (bpBid - (bpBid `div` chargingFee contractInfo)), Ada.lovelaceValueOf (bpBid `div` chargingFee contractInfo))
                            lookups = Constraints.scriptInstanceLookups tradingInstance <>
                                        Constraints.otherScript tradingValidator          <>
                                        Constraints.unspentOutputs (Map.singleton oref o)
                            tx =    mustPayToPubKey odOwner receiverAmount <>
                                    mustPayToTheScript MkCharge adminAmount <>
                                    mustSpendScriptOutput oref (Redeemer $ PlutusTx.toData (Buy bid))
                        void $ submitTxConstraintsWith lookups tx
        _ -> throwError "utxo invalid"

setOffer :: forall w s. HasBlockchainActions s => OfferParams -> Contract w s Text ()
setOffer OfferParams{..} = do
    pkh <- pubKeyHash <$> ownPubKey
    let opOfferValue = listToValue opOffer
    let offer = MkOffer $ OfferDatum {odOwner = pkh, odRequest = opRequest}
        tx = mustPayToTheScript offer opOfferValue
    void $ submitTxConstraints tradingInstance tx


withdraw :: forall w s. HasBlockchainActions s => Contract w s Text ()
withdraw = do
    utxos <- Map.filter isCharge <$> utxoAt tradingAddress
    case Map.toList utxos of
        [] -> throwError "no utxo found"
        _ -> do
            let tx = collectFromScript utxos Withdraw
            void (submitTxConstraintsSpending tradingInstance utxos tx)

    where
        isCharge :: TxOutTx -> Bool
        isCharge o = case txOutDatumHash $ txOutTxOut o of
            Nothing -> False
            Just h  -> case Map.lookup h $ txData $ txOutTxTx o of
                Nothing        -> False
                Just (Datum e) -> case PlutusTx.fromData e of
                    Just MkCharge  -> True
                    _ -> False

cancel :: forall w s. HasBlockchainActions s => CancelParams -> Contract w s Text ()
cancel CancelParams{..} = do
    pkh <- pubKeyHash <$> ownPubKey
    let v = listToValue cpCancel
    utxos <- Map.filter (isOpenOrder pkh v) <$> utxoAt tradingAddress
    case Map.toList utxos of
        [] -> throwError "no utxo found"
        _ -> do
            let tx = collectFromScript utxos Cancel
            void (submitTxConstraintsSpending tradingInstance utxos tx)
    where
        isOpenOrder :: PubKeyHash -> Value -> TxOutTx -> Bool
        isOpenOrder pkh v o = case txOutDatumHash $ txOutTxOut o of
            Nothing -> False
            Just h  -> case Map.lookup h $ txData $ txOutTxTx o of
                Nothing        -> False
                Just (Datum e) -> case PlutusTx.fromData e of
                    Just (MkBid b)  -> bdRequest b == v && bdOwner b == pkh
                    Just (MkOffer f) -> txOutValue (txOutTxOut o) == v && odOwner f == pkh
                    _ -> False



-- make util

listToValue :: [(TokenName, Integer)] -> Value
listToValue [] = mempty
listToValue (h:t) = Value.singleton (policy contractInfo) (fst h) (snd h) <> listToValue t

hasActiveBid :: TxOutTx -> Value -> Bool
hasActiveBid o v = do
    case getTradingDatum o of
        Just (MkBid b) -> bdRequest b == v
        _      -> False

hasActiveOffer :: TxOutTx -> Value -> Bool
hasActiveOffer o v = txOutValue (txOutTxOut o) == v

getActiveOffer :: HasBlockchainActions s => TxOutTx -> Contract w s Text (OfferDatum,Value)
getActiveOffer o = do
    case getTradingDatum o of
        Just (MkOffer f) -> return (f,txOutValue $ txOutTxOut o)
        _ -> throwError "Offer Datum invalid"

getTradingDatum :: TxOutTx -> Maybe TradingDatum
getTradingDatum o = do
    let datum = let [(hash, datum')] = Map.toList (txData (txOutTxTx o)) in datum'
    let parsedDatum = PlutusTx.fromData (getDatum datum) :: Maybe TradingDatum
    case parsedDatum of
        Just (b) -> Just b
        _      -> Nothing

getActiveBid :: HasBlockchainActions s => TxOutTx -> Contract w s Text (BidDatum, Value)
getActiveBid o = do
    case getTradingDatum o of
        Just (MkBid b) -> return (b, txOutValue $ txOutTxOut o)
        _ -> throwError "Bid Datum invalid"

-- make schema

data BidParams = BidParams
    { bpRequest    :: ![(TokenName, Integer)]
    , bpBid        :: !Integer
    } deriving (Generic, ToJSON, FromJSON, ToSchema)

data OfferParams = OfferParams
    { opRequest    :: !Integer
    , opOffer      :: ![(TokenName, Integer)]
    } deriving (Generic, ToJSON, FromJSON, ToSchema)

data CancelParams = CancelParams
    { cpCancel    :: ![(TokenName, Integer)]
    } deriving (Generic, ToJSON, FromJSON, ToSchema)


type TradingSchema =
    BlockchainActions
        .\/ Endpoint "setBid" BidParams
        .\/ Endpoint "setOffer" OfferParams
        .\/ Endpoint "buy" BidParams
        .\/ Endpoint "sell" OfferParams
        .\/ Endpoint "withdraw" ()
        .\/ Endpoint "cancel" CancelParams

endpoints :: Contract () TradingSchema Text ()
endpoints = (setBid' `select` setOffer' `select` sell' `select` buy' `select` withdraw' `select` cancel') >> endpoints
    where
        setBid' = endpoint @"setBid" >>= setBid
        setOffer' = endpoint @"setOffer" >>= setOffer
        sell' = endpoint @"sell" >>= sell
        buy' = endpoint @"buy" >>= buy
        withdraw' = endpoint @"withdraw" >> withdraw
        cancel' = endpoint @"cancel" >>= cancel


mkSchemaDefinitions ''TradingSchema

spacebud0 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBud0" :| [])
spacebud1 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBud1" :| [])
spacebud2 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBud2" :| [])
spacebud3 = KnownCurrency (ValidatorHash "f") "Token" (TokenName "SpaceBud3" :| [])

mkKnownCurrencies ['spacebud0,'spacebud1, 'spacebud2, 'spacebud3]