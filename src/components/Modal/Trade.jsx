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
} from "@chakra-ui/react";
import { UnitDisplay } from "../UnitDisplay";

const toUnit = (amount, decimals = 6) => {
  const result = parseFloat(amount.replace(/[,\s]/g, ""))
    .toLocaleString("en-EN", { minimumFractionDigits: decimals })
    .replace(/[.,\s]/g, "");
  if (!result) return "0";
  else if (result == "NaN") return "0";
  return result;
};

const TradeModal = React.forwardRef(
  ({ budId, market, onConfirm, details }, ref) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [ada, setAda] = React.useState("");
    const [{ type, minPrice }, setData] = React.useState({
      type: "BID",
      minPrice: "0",
    });

    React.useImperativeHandle(ref, () => ({
      openModal({ type, minPrice }) {
        setData({ type, minPrice });
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
            {type == "BID" ? "Bid" : "Offer"}
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
                onChange={(e) => setAda(e.target.value)}
                rounded="3xl"
                focusBorderColor="purple.500"
                placeholder={type == "BID" ? "Bid amount" : "Offer amount"}
                type="number"
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
              isDisabled={window.BigInt(toUnit(ada)) < window.BigInt(minPrice)}
              rounded="3xl"
              onClick={async () => {
                let txHash;
                if (type == "BID") {
                  txHash = await market.bid(details.bid.bidUtxo, toUnit(ada));
                } else {
                  txHash = await market.offer(budId, toUnit(ada));
                }
                onConfirm(txHash);
              }}
            >
              {type == "BID" ? "Bid" : "Offer"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

export default TradeModal;
