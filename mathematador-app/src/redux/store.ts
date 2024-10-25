import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import gameReducer from './slices/gameSlice';
import navigationReducer from './slices/navigationSlice';
// Import other reducers as needed

const store = configureStore({
  reducer: {
    user: userReducer,
    game: gameReducer,
    navigation: navigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
