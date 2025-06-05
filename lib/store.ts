import { configureStore } from "@reduxjs/toolkit";
import moodReducer from "./features/moodSlice";
import musicReducer from "./features/musicSlice";
import userReducer from "./features/userSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      mood: moodReducer,
      music: musicReducer,
      user: userReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

/**
 * Redux Toolkit Setup with Next.js
 * https://redux.js.org/usage/nextjs
 *
 * Redux in Server-Side Rendered Next.js: Merging Server and Client State
 * https://serhiikoziy.medium.com/redux-in-server-side-rendered-next-js-merging-server-and-client-state-bb728c601c92
 */
