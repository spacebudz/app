import { StoreProvider as SProvider, useStoreRehydrated } from "easy-peasy";
import * as React from "react";
import { store } from "../store";

export const StoreProvider = ({ children }) => {
  return (
    <SProvider store={store}>
      <WaitForStateRehydration>{children}</WaitForStateRehydration>
    </SProvider>
  );
};

export const RehydrationContext = React.createContext(false);

const WaitForStateRehydration = ({ children }) => {
  const isRehydrated = useStoreRehydrated();
  return (
    <RehydrationContext.Provider value={isRehydrated}>
      {children}
    </RehydrationContext.Provider>
  );
};
