const { createStore, action } = require("easy-peasy");

const store = createStore({
  connection: {
    connected: false,
    setConnected: action((state) => {
      state.connected = true;
    }),
  },
});

export default store;
