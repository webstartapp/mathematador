import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import gameReducer from "@/redux/slices/gameSlice";
import navigationReducer from "@/redux/slices/navigationSlice";
import settingsReducer from "@/redux/slices/settingsSlice";
import userReducer from "@/redux/slices/userSlice";
// Import other reducers as needed
const createNoopStorage = (): {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<string>;
  removeItem: (key: string) => Promise<void>;
} => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined" ? AsyncStorage : createNoopStorage();

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "game", "navigation", "settings"], // Only these reducers will be persisted
};
const rootReducer = combineReducers({
  user: userReducer,
  game: gameReducer,
  navigation: navigationReducer,
  settings: settingsReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      // Default warnAfter (32ms) is tuned for typical web/CI hardware - a
      // mid-range Android device's JS thread is slow enough that walking
      // this app's state tree routinely crosses it on an ordinary dispatch
      // (confirmed live: 39-65ms on a physical device, nothing actually
      // wrong with any reducer). The check itself stays on - it still
      // catches a genuine accidental mutation - only the noisy dev-console
      // warning threshold is raised to match real device performance
      // instead of a desktop-tuned default. Dev-only either way; this
      // middleware doesn't run in production builds at all.
      immutableCheck: {
        warnAfter: 128,
      },
    }),
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
