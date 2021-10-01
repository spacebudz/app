import { mdiFacebook, mdiReddit, mdiTwitter, mdiLink } from "@mdi/js";
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
  Tooltip,
  useClipboard,
} from "@chakra-ui/react";
import Icon from "@mdi/react";
const ShareModal = ({ isOpen, onOpen, onClose, bud }) => {
  const { hasCopied, onCopy } = useClipboard(
    `https://spacebudz.io/explore/spacebud/${bud.id}`
  );
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center" mt="2">
          Share
        </ModalHeader>
        <Box textAlign="center" mt="-2" color="GrayText">
          SPACEBUD #{bud.id}
        </Box>
        <Box h={6} />
        <ModalBody display="flex" alignItems="center" justifyContent="center">
          <div
            style={{
              width: 300,
              height: 300,
              marginTop: -30,
              marginBottom: -30,
            }}
          >
            <img src={bud.image} width="100%" />
          </div>{" "}
        </ModalBody>
        <ModalFooter display="flex" justifyContent="center" mt={5} mb={4}>
          <Tooltip
            label="Copied link"
            isOpen={hasCopied}
            placement="top"
            rounded="3xl"
          >
            <Button rounded="3xl" onClick={onCopy}>
              <Icon path={mdiLink} size={1} />
            </Button>
          </Tooltip>
          <Box w={3} />
          <Button
            rounded="3xl"
            onClick={() =>
              window.open(
                `https://twitter.com/intent/tweet?text=Check%20out%20SpaceBud%20%23${bud.id}!%0A&url=${window.location.href}`
              )
            }
          >
            <Icon path={mdiTwitter} size={1} />
          </Button>
          <Box w={3} />

          <Button
            rounded="3xl"
            onClick={() =>
              window.open(
                "https://www.facebook.com/sharer/sharer.php?u=" +
                  encodeURIComponent(window.location.href),
                "facebook-share-dialog"
              )
            }
          >
            <Icon path={mdiFacebook} size={1} />
          </Button>
          <Box w={3} />

          <Button
            rounded="3xl"
            onClick={() =>
              window.open(
                `http://www.reddit.com/submit?url=${window.location.href}&title=Check%20out%20SpaceBud%20%23${bud.id}!`
              )
            }
          >
            <Icon path={mdiReddit} size={1} />
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShareModal;
