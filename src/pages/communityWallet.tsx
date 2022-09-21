import * as React from "react";
import NumberFormat from "react-number-format";
import { ExternalLink } from "styled-icons/evaicons-solid";
import { Button, Ellipsis, Input, Spinner } from "../components";
import { MainLayout } from "../layouts/mainLayout";
import { fromLovelaceDisplay, toLovelace } from "../utils";
import { useQueryParam } from "use-query-params";
import { FlatButton } from "../components/Button/FlatButton";
import { ArrowRightShort } from "@styled-icons/bootstrap/ArrowRightShort";
import { getBalance, getMultisigSession } from "../api";
import { useStoreState } from "easy-peasy";
const { createMultisig, createTransaction, signTransaction } =
  typeof window !== "undefined" &&
  (await import("../parts/communityWallet/txBuilder"));
const S = await import(
  "../cardano/market/custom_modules/@emurgo/cardano-multiplatform-lib-browser"
);

const CommunityWallet = () => {
  const [loading, setLoading] = React.useState(true);
  const [loadingTx, setLoadingTx] = React.useState(false);
  const [result, setResult] = React.useState<string | JSX.Element>("");
  const [recipients, setRecipients] = React.useState<
    { address: string; amount: string }[]
  >([{ address: "", amount: "" }]);

  const [purpose, setPurpose] = React.useState<string>("");
  const [session] = useQueryParam<string>("session");
  const [error, setError] = React.useState("");
  const [balance, setBalance] = React.useState<BigInt>(BigInt(0));

  const [sessionDetails, setSessionDetails] = React.useState({
    tx: "",
    purpose: "",
    totalRequested: BigInt(0),
    witnesses: [],
  });

  const { address } = typeof window !== "undefined" && createMultisig();
  const wallet = useStoreState<any>((state) => state.wallet.wallet);

  const init = async () => {
    setLoading(true);
    const balance = await getBalance(address);
    setBalance(
      balance.find((b) => b.unit === "lovelace")?.quantity || BigInt(0)
    );
    if (session) {
      const data = await getMultisigSession(session);
      const tx = S.Transaction.from_bytes(Buffer.from(data.tx, "hex"));
      const purpose = JSON.parse(
        S.decode_metadatum_to_json_str(
          tx.auxiliary_data().metadata().get(S.BigNum.from_str("674")),
          S.MetadataJsonSchema.BasicConversions
        )
      )?.msg.reduce((a, b) => a + b, "");

      const outputs = tx.body().outputs();
      let totalRequested = BigInt(0);
      for (let i = 0; i < outputs.len(); i++) {
        const output = outputs.get(i);
        if (output.address().to_bech32() === address) continue;
        totalRequested += BigInt(output.amount().coin().to_str());
      }

      setSessionDetails({
        tx: data.tx,
        witnesses: data.witnesses,
        purpose,
        totalRequested,
      });
    }
    setLoading(false);
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <MainLayout
      title="SpaceBudz | Community wallet"
      titleTwitter="SpaceBudz: Community wallet"
    >
      {loading ? (
        <div className="w-full flex flex-col flex-grow justify-center items-center">
          <Spinner theme="violet" className="!w-6 md:!w-8" />
          <div className="mt-8 md:mt-10 font-medium text-slate-500">
            Loading wallet...
          </div>
        </div>
      ) : (
        <div className="w-full flex justify-center items-center mb-40">
          <div className="px-6 mt-4 md:mt-0 max-w-5xl w-full">
            <div className="font-bold text-primary text-3xl mb-16">
              Community wallet
            </div>
            <div className="text-md break-all font-bold">
              <Ellipsis className="max-w-md">{address}</Ellipsis>
              <a
                href={`https://cardanoscan.io/address/${address}`}
                target="_blank"
              >
                <ExternalLink size={16} />
              </a>
            </div>
            <div className="text-2xl font-bold mt-6 mb-2">Balance</div>
            <div className="text-md text-xl font-semibold text-primary">
              {fromLovelaceDisplay(balance)}
            </div>
            <div className="h-12" />
            <div className="w-full flex flex-col">
              {session ? (
                <>
                  <div className="w-3/4 h-[2px] bg-slate-200" />
                  <div className="h-12" />

                  <div className="text-2xl font-bold mb-2">Session</div>
                  <div>{session}</div>
                  <div className="text-2xl font-bold mb-2 mt-8">
                    Total requested
                  </div>
                  <div className="text-md text-xl font-semibold text-primary">
                    {fromLovelaceDisplay(sessionDetails.totalRequested)}
                  </div>
                  <div className="text-2xl font-bold mt-8 mb-2">
                    Purpose of use
                  </div>
                  <div className="max-w-md">{sessionDetails.purpose}</div>
                  <div className="text-2xl font-bold mb-2 mt-8">Signatures</div>
                  <div>
                    <span
                      className={`text-xl font-medium ${
                        sessionDetails.witnesses.length >= 3
                          ? "text-green-500"
                          : ""
                      }`}
                    >
                      {sessionDetails.witnesses.length} / 6
                    </span>{" "}
                    <span>
                      ({3 - sessionDetails.witnesses.length} more needed)
                    </span>
                  </div>
                  <Button
                    disabled={
                      !wallet.address || sessionDetails.witnesses.length >= 3
                    }
                    loading={loadingTx}
                    className="w-fit mt-12"
                    onClick={async () => {
                      setLoadingTx(true);
                      const action = await signTransaction(
                        session,
                        sessionDetails.tx
                      ).catch((e) => setError(e.message));
                      if (!action) {
                        setLoadingTx(false);
                        return;
                      }
                      if (action === "Signed") setResult("Successfully signed");
                      else if (action.Submitted)
                        setResult(
                          <span>
                            Successfully signed and submitted:
                            <br />
                            <a
                              href={`https://cardanoscan.io/transaction/${action.Submitted}`}
                              target="_blank"
                              className="underline"
                            >
                              {action.Submitted}
                            </a>
                          </span>
                        );
                      setLoadingTx(false);
                    }}
                  >
                    Sign transaction
                  </Button>
                  {!wallet.address && (
                    <div className="max-w-fit mt-2 text-gray-500 leading-5 font-light">
                      Login to sign
                    </div>
                  )}
                  {error && (
                    <div className="font-semibold text-rose-400 mt-4">
                      {error}
                    </div>
                  )}
                  {result && (
                    <div className="font-semibold text-primary mt-4">
                      {result}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {recipients.map((recipient, index) => (
                    <div className="flex my-1" key={index}>
                      <Input
                        classNameContainer="w-2/4 lg:w-3/4"
                        placeholder="Recipient address"
                        theme="white"
                        value={recipient.address}
                        onChange={(e) => {
                          recipient.address = e.target.value;
                          setRecipients((recipients) => [...recipients]);
                        }}
                      />
                      <div className="w-2 md:w-8" />
                      <NumberFormat
                        theme="white"
                        classNameContainer="w-2/4 lg:w-1/4"
                        placeholder="Amount"
                        rightEl={"₳"}
                        customInput={Input}
                        allowNegative={false}
                        thousandsGroupStyle="thousand"
                        decimalSeparator="."
                        displayType="input"
                        type="text"
                        thousandSeparator={true}
                        decimalScale={6}
                        allowEmptyFormatting={true}
                        value={recipient.amount}
                        onValueChange={({ value }) => {
                          recipient.amount = value;
                          setRecipients((recipients) => [...recipients]);
                        }}
                      />
                    </div>
                  ))}
                  <div className="flex">
                    <Button
                      size="xs"
                      className="mt-4 ml-2 w-28"
                      theme="slate"
                      onClick={() =>
                        setRecipients((recipients) => [
                          ...recipients,
                          { address: "", amount: "" },
                        ])
                      }
                    >
                      + Recipient
                    </Button>
                    {recipients.length > 1 && (
                      <Button
                        size="xs"
                        className="mt-4 ml-2 w-28"
                        theme="rose"
                        onClick={() =>
                          setRecipients((recipients) => [
                            ...recipients.slice(0, -1),
                          ])
                        }
                      >
                        - Recipient
                      </Button>
                    )}
                  </div>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="border-2 border-b-4 rounded-xl p-2 outline-none font-semibold h-28 mt-8"
                    placeholder="Purpose of use"
                  />
                  <Button
                    disabled={
                      !recipients.every(
                        (recipient) => recipient.address && recipient.amount
                      ) || !purpose
                    }
                    loading={loadingTx}
                    className="mt-8"
                    onClick={async () => {
                      setLoadingTx(true);
                      setError("");
                      try {
                        const session = await createTransaction(
                          recipients.map((recipient) => ({
                            ...recipient,
                            amount: toLovelace(recipient.amount),
                          })),
                          purpose
                        );
                        setResult(
                          "https://spacebudz.io/communityWallet?session=" +
                            session
                        );
                      } catch (e) {
                        setError("Transaction could not be created");
                      }
                      setLoadingTx(false);
                    }}
                  >
                    Create transaction
                  </Button>
                  {error && (
                    <div className="font-semibold text-rose-400 mt-4">
                      {error}
                    </div>
                  )}
                  {result && (
                    <div className="w-full mt-10 flex justify-center items-center">
                      <div>
                        <a
                          href={result as string}
                          className="text-primary font-semibold underline"
                        >
                          {result}
                        </a>
                      </div>
                      <div>
                        <a
                          href={result as string}
                          className="text-primary font-semibold underline"
                        >
                          <FlatButton size="sm" className="ml-4">
                            <ArrowRightShort
                              size={20}
                              className="stroke-white stroke-1"
                            />
                          </FlatButton>
                        </a>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CommunityWallet;
