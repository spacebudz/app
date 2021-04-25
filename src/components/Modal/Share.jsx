import { mdiFacebook, mdiReddit, mdiTwitter } from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";
import { Modal, Snippet, Spacer } from "@geist-ui/react";

const ShareModal = (props) => {
  return (
    <Modal {...props.modal.bindings} open={props.modal.visible}>
      <Modal.Title>Share</Modal.Title>
      <Modal.Subtitle>SpaceBud #{props.bud.id}</Modal.Subtitle>
      <Modal.Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{ width: 300, height: 300, marginTop: -30, marginBottom: -30 }}
        >
          <img src={props.bud.image} width="100%" />
        </div>

        <Spacer y={1} />

        <Snippet
          width="90%"
          text={`https://spacebudz.io/explore/spacebud/${props.bud.id}`}
          symbol=""
          toastText="Copied Link"
        />
      </Modal.Content>
      <Modal.Action
        passive
        onClick={() =>
          window.open(
            `https://twitter.com/intent/tweet?text=Check%20out%20SpaceBud%20%23${props.bud.id}!%0A&url=${window.location.href}`
          )
        }
      >
        <Icon path={mdiTwitter} size={1} />
      </Modal.Action>
      <Modal.Action
        passive
        onClick={() =>
          window.open(
            "https://www.facebook.com/sharer/sharer.php?u=" +
              encodeURIComponent(window.location.href),
            "facebook-share-dialog"
          )
        }
      >
        <Icon path={mdiFacebook} size={1} />
      </Modal.Action>
      <Modal.Action
        passive
        onClick={() =>
          window.open(
            `http://www.reddit.com/submit?url=${window.location.href}&title=Check%20out%20SpaceBud%20%23${props.bud.id}!`
          )
        }
      >
        <Icon path={mdiReddit} size={1} />
      </Modal.Action>
    </Modal>
  );
};

export default ShareModal;
