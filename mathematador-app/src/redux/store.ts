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
import userReducer from "@/redux/slices/userSlice";
// Import other reducers as needed
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["user", "game", "navigation"], // Only these reducers will be persisted
};
const rootReducer = combineReducers({
  user: userReducer,
  game: gameReducer,
  navigation: navigationReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
