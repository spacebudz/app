import { action, createStore, persist } from "easy-peasy";

const wallet = {
  wallet: {
    address: "",
    walletName: "",
    sessionTime: null,
  },
  setWallet: action((state, payload) => {
    state.wallet = payload;
  }),
  resetWallet: action((state, payload) => {
    state.wallet = {
      address: "",
      walletName: "",
      icon: "",
      sessionTime: null,
    };
  }),
};

const explore = {
  array: null,
  activity: null,
  page: 0,
  lastUpdate: null,
  setArray: action((state, payload) => {
    state.array = payload;
  }),
  setActivity: action((state, payload) => {
    state.activity = payload;
  }),
  incrementPage: action((state) => {
    state.page += 1;
  }),
  renewLastUpdate: action((state) => {
    state.lastUpdate = Date.now();
  }),
};

const profile = {
  array: null,
  index: 0,
  lastUpdate: null,
  balance: 0,
  lastAddress: null,
  categories: [0, 0, 0],
  setArray: action((state, payload) => {
    state.array = payload;
  }),
  setIndex: action((state, payload) => {
    state.index = payload;
  }),
  renewLastUpdate: action((state) => {
    state.lastUpdate = Date.now();
  }),
  setBalance: action((state, payload) => {
    state.balance = payload;
  }),
  setCategories: action((state, payload) => {
    state.categories = payload;
  }),
  setLastAddress: action((state, payload) => {
    state.lastAddress = payload;
  }),
};

export const store = createStore({
  wallet: persist(wallet, { storage: "localStorage" }),
  explore,
  profile,
});
