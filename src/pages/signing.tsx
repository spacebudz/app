import * as React from "react";
import { Button } from "../components";
import { MainLayout } from "../layouts/mainLayout";
import { useStoreState } from "easy-peasy";
import { getLucid, getSelectedWallet } from "../utils";

const Signing = () => {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string>("");
  const wallet = useStoreState<any>((state) => state.wallet.wallet);
  const [raw, setRaw] = React.useState<string>("");

  return (
    <MainLayout>
      <div className="w-full flex justify-center items-center mb-40">
        <div className="px-6 mt-4 md:mt-0 max-w-5xl w-full">
          <div className="font-bold text-primary text-3xl mb-16">Signing</div>
          <div className="text-md break-all font-bold"></div>
          <div className="w-full flex flex-col">
            <>
              <div className="flex"></div>
              <textarea
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                className="border-2 border-b-4 rounded-xl p-2 outline-none h-28 mt-8"
                placeholder="Raw transaction"
              />
              <Button
                disabled={!wallet.address}
                loading={loading}
                className="mt-8"
                onClick={async () => {
                  setLoading(true);
                  const lucid = await getLucid();
                  const walletApi = await getSelectedWallet();
                  lucid.selectWallet(walletApi);
                  const witnesses = await lucid
                    .fromTx(raw)
                    .partialSign()
                    .catch((e) => console.log(e));
                  setResult(witnesses || "");
                  setLoading(false);
                }}
              >
                Sign transaction
              </Button>
              {result && (
                <div className="w-full mt-10 flex justify-center items-center flex-col">
                  <div>Witness:</div>
                  <div className="font-semibold max-w-5xl break-all">
                    {result}
                  </div>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Signing;
