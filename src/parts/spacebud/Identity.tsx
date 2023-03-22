import * as React from "react";
import { Button, Input } from "../../components";
import { Dialog } from "../../components/Dialog";
import { toast } from "../../components/Toast";
import { pendingTxToast, successTxToast, tradeErrorHandler } from "./Dialog";
import { getSelectedWallet } from "../../utils";
import { baseUrl, projectId } from "../../api";
// import { Lucid, Blockfrost, Contract } from "@spacebudz/spacebudz-identity";

type IdentityDialogProps = {
  identity: any;
  budId: number;
  checkTx: ({ txHash }) => void;
};

let lucid;

export const IdentityDialog = React.forwardRef(
  ({ identity, budId, checkTx }: IdentityDialogProps, ref) => {
    const [input, setInput] = React.useState<{
      nickname?: string;
      color?: string;
      urbit?: string;
      twitter?: string;
      discord?: string;
      email?: string;
    }>({
      nickname: "",
      color: "",
      urbit: "",
      twitter: "",
      discord: "",
      email: "",
    });

    const [loading, setLoading] = React.useState({
      update: false,
      reset: false,
    });
    const dialogRef = React.useRef<any>();

    React.useImperativeHandle(ref, () => ({
      open: () => {
        setInput({
          nickname: identity.nickname || "",
          color: identity.color || "",
          urbit: identity.urbit?.[0] || "",
          twitter: identity.twitter?.[0] || "",
          discord: identity.discord?.[0] || "",
          email: identity.email?.[0] || "",
        });
        dialogRef.current.open();
      },
      close: () => dialogRef.current.close(),
    }));

    const onConfirm = async (reset?: boolean) => {
      reset
        ? setLoading((l) => ({ ...l, reset: true }))
        : setLoading((l) => ({ ...l, update: true }));
      const selectedWallet = await getSelectedWallet();

      const metadata: any = {};
      if (!reset) {
        if (input.nickname) metadata.nickname = input.nickname;
        if (input.color) metadata.color = input.color;
        if (input.urbit) metadata.urbit = [input.urbit];
        if (input.twitter) metadata.twitter = [input.twitter];
        if (input.discord) metadata.discord = [input.discord];
        if (input.email) metadata.email = [input.email];
      }

      // lucid = await Lucid.new(new Blockfrost(baseUrl, projectId));

      lucid.selectWallet(selectedWallet as any);
      // const contract = new Contract(lucid);

      // const txHash = await contract
      //   .updateIdentity(budId, metadata)
      //   .catch((e) => tradeErrorHandler(e));

      setLoading({ reset: false, update: false });
      // if (!txHash) return;
      // checkTx({
      //   txHash,
      // });
      dialogRef.current.close();
    };

    return (
      <Dialog
        ref={dialogRef}
        onClose={() => setLoading({ reset: false, update: false })}
      >
        <div className="w-full flex flex-col items-center">
          <div className="w-full text-2xl font-semibold mb-4">Identity</div>
          <div className="w-full self-start mb-8 text-md">
            <div>
              Update identity of{" "}
              <span className="font-bold inline-block">SpaceBud #{budId}</span>.
              <br />
              Make sure you only set data you are comfortable with. Everything
              is publicly registered on the blockchain.
            </div>
          </div>
          <div className="w-3/4 max-w-[260px]">
            <Input
              value={input.nickname}
              onChange={(e) =>
                e.target.value.length <= 64 &&
                setInput((i) => ({ ...i, nickname: e.target.value }))
              }
              classNameContainer="mb-4"
              placeholder="Nickname"
              theme="space"
            />
            <Input
              value={input.color}
              onChange={(e) =>
                e.target.value.length <= 7 &&
                setInput((i) => ({ ...i, color: e.target.value }))
              }
              classNameContainer="mb-4"
              placeholder="Color (#ffffff)"
              theme="space"
            />
            <Input
              value={input.urbit}
              onChange={(e) =>
                e.target.value.length <= 64 &&
                setInput((i) => ({ ...i, urbit: e.target.value }))
              }
              classNameContainer="mb-4"
              placeholder="Urbit"
              theme="space"
            />
            <Input
              value={input.twitter}
              onChange={(e) =>
                e.target.value.length <= 64 &&
                setInput((i) => ({ ...i, twitter: e.target.value }))
              }
              classNameContainer="mb-4"
              placeholder="Twitter (@profile)"
              theme="space"
            />
            <Input
              value={input.discord}
              onChange={(e) =>
                e.target.value.length <= 64 &&
                setInput((i) => ({ ...i, discord: e.target.value }))
              }
              classNameContainer="mb-4"
              placeholder="Discord"
              theme="space"
            />
            <Input
              value={input.email}
              onChange={(e) =>
                e.target.value.length <= 64 &&
                setInput((i) => ({ ...i, email: e.target.value }))
              }
              classNameContainer="mb-4"
              placeholder="Email"
              theme="space"
            />
          </div>
          <div className="w-full flex justify-end mt-10">
            <Button
              theme="rose"
              loading={loading.reset}
              className="mr-2"
              onClick={() => onConfirm(true)}
            >
              Reset
            </Button>
            <Button
              disabled={Object.keys(input).every((k) => !input[k])}
              loading={loading.update}
              className="mr-2"
              onClick={() => onConfirm()}
            >
              Update
            </Button>
            <Button theme="space" onClick={() => dialogRef.current.close()}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }
);

export const checkTxIdentity = async ({ txHash }) => {
  if (!txHash) return;
  pendingTxToast();

  await lucid.awaitTx(txHash);
  toast.dismiss();
  successTxToast(txHash);
  await new Promise((res, rej) => setTimeout(() => res(1), 1000));
  const event = new Event("confirm");
  window.dispatchEvent(event);
};
