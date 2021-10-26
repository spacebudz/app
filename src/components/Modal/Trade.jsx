import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import {
  CheckCircleIcon,
  ExternalLinkIcon,
  InfoIcon,
  WarningIcon,
} from "@chakra-ui/icons";
import { UnitDisplay } from "../UnitDisplay";

const toUnit = (amount, decimals = 6) => {
  const result = parseFloat(amount.replace(/[,\s]/g, ""))
    .toLocaleString("en-EN", { minimumFractionDigits: decimals })
    .replace(/[.,\s]/g, "");
  if (!result) return "0";
  else if (result == "NaN") return "0";
  return result;
};

export const tradeErrorHandler = (e, toast) => {
  console.log(e);
  if (e.message) {
    if (e.message.includes("budget was overspent"))
      FailedTransactionToast(toast, "Execution units too low.");
    else if (e.message.includes("BadInputs"))
      FailedTransactionToast(toast, "Trade in use, try again.");
    else if (e.message.includes("INPUTS_EXHAUSTED"))
      FailedTransactionToast(toast, "Insufficent balance");
    else if (e.message.includes("INPUT_LIMIT_EXCEEDED"))
      FailedTransactionToast(toast, "Too many UTxOs. Refactor wallet.");
    else if (e.message.includes("MAX_SIZE_REACHED"))
      FailedTransactionToast(toast, "Size too large");
  } else if (e.info) {
    FailedTransactionToast(toast, e.info);
  } else {
    if (e.includes("NFTs")) FailedTransactionToast(toast, "Size too large");
    else FailedTransactionToast(toast, "Something went wrong");
  }
};

const isBrowser = () => typeof window !== "undefined";

const TradeModal = React.forwardRef(
  ({ budId, market, onConfirm, details }, ref) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ada, setAda] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [{ type, minPrice }, setData] = React.useState({
      type: "BID",
      minPrice: "0",
    });
    const toast = useToast();

    React.useImperativeHandle(ref, () => ({
      openModal({ type, minPrice }) {
        setData({ type, minPrice });
        setAda("");
        onOpen();
      },
      closeModal() {
        onClose();
      },
    }));

    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" mt="2">
            {type == "BID" ? "Bid" : "Listing"}
          </ModalHeader>
          <Box textAlign="center" mt="-2" color="GrayText">
            SPACEBUD #{budId}
          </Box>
          <Box h={6} />
          <ModalBody
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <InputGroup width="70%">
              <InputLeftElement
                pointerEvents="none"
                color="gray.300"
                fontSize="1.2em"
                children="₳"
              />
              <Input
                value={ada}
                onChange={(e) => {
                  const v = e.target.value;
                  if (!v.match("[0-9]+([.,][0-9]+)?") && v) return;
                  setAda(v);
                }}
                placeholder={type == "BID" ? "Bid amount" : "List price"}
              />
            </InputGroup>
            <Box h={3} />

            <Box fontSize={12} display="flex" alignItems="center">
              <Box mr={1}>At least</Box>
              <UnitDisplay quantity={minPrice} decimals={6} symbol="ADA" />
            </Box>
          </ModalBody>
          <ModalFooter display="flex" justifyContent="center" mt={5} mb={4}>
            <Button rounded="3xl" onClick={onClose} mr="3">
              Close
            </Button>
            <Button
              width="100px"
              colorScheme="purple"
              isDisabled={
                (isBrowser() &&
                  window.BigInt(toUnit(ada)) < window.BigInt(minPrice)) ||
                isLoading
              }
              isLoading={isLoading}
              rounded="3xl"
              onClick={async () => {
                setIsLoading(true);
                let txHash;
                if (type == "BID") {
                  txHash = await market
                    .bid(details.bid.bidUtxo, toUnit(ada))
                    .catch((e) => tradeErrorHandler(e, toast));
                } else {
                  txHash = await market
                    .offer(budId, toUnit(ada))
                    .catch((e) => tradeErrorHandler(e, toast));
                }
                setIsLoading(false);
                if (!txHash) return;
                onConfirm(txHash, {
                  type: type == "BID" ? "bid" : "list",
                  lovelace: toUnit(ada),
                });
                onClose();
              }}
            >
              {type == "BID" ? "Bid" : "List"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

export const FailedTransactionToast = (toast, error) => {
  return toast({
    position: "bottom-right",
    status: "error",
    duration: 5000,
    isClosable: true,
    render: () => (
      <Box
        background="red.400"
        color="white"
        px={6}
        py={3}
        rounded="3xl"
        display="flex"
        alignItems="center"
      >
        <WarningIcon />
        <Box display="flex" flexDirection="column" ml="3">
          <Box fontWeight="medium">Transaction not possible</Box>
          <Box fontSize={12}>{error}</Box>
        </Box>
      </Box>
    ),
  });
};

export const PendingTransactionToast = (toast) => {
  toast({
    position: "bottom-right",
    render: () => (
      <Box
        background="purple.400"
        color="white"
        px={6}
        py={3}
        rounded="3xl"
        display="flex"
        alignItems="center"
      >
        <InfoIcon />
        <Box ml="3" fontWeight="medium">
          Transaction pending
        </Box>
        <Spinner ml="4" speed="0.5s" size="sm" />
      </Box>
    ),
    duration: null,
  });
};

export const SuccessTransactionToast = (toast, txHash) => {
  toast({
    position: "bottom-right",
    render: () => (
      <Box
        background="green.400"
        color="white"
        px={6}
        py={3}
        rounded="3xl"
        display="flex"
        alignItems="center"
      >
        <CheckCircleIcon />
        <Box ml="3" fontWeight="medium">
          Transaction confirmed
        </Box>
        <ExternalLinkIcon
          cursor="pointer"
          ml="4"
          onClick={() =>
            isBrowser() &&
            window.open(`https://cardanoscan.io/transaction/${txHash}`)
          }
        />
      </Box>
    ),
    duration: 9000,
  });
};

export default TradeModal;
