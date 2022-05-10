import { getAddressBech32, getCardano } from "../../utils";

export const setSelectedWallet = async (
  walletName: string
): Promise<string | undefined> => {
  const cardano = getCardano();
  if (!cardano[walletName]) return;
  const api = await cardano[walletName].enable().catch((e) => {});
  if (!api) return;
  cardano.selectedWallet = {
    walletName,
    ...cardano[walletName],
    ...api,
  };
  const addressBech32 = getAddressBech32(
    (await api.getUsedAddresses())[0] || (await api.getUnusedAddresses())[0]
  );
  return addressBech32;
};
