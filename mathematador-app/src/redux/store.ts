import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
 } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userReducer from './slices/userSlice';
import gameReducer from './slices/gameSlice';
import navigationReducer from './slices/navigationSlice';
// Import other reducers as needed
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'game', 'navigation'], // Only these reducers will be persisted
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

export {store, persistor};
