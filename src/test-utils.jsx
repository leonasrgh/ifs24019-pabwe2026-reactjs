import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import {
  isAuthLoginReducer,
  isAuthRegisterReducer,
  isAuthLogoutReducer,
} from "./features/auth/states/reducer";
import {
  usersReducer,
  userReducer,
  profileReducer,
  isProfileReducer,
  isChangeProfileReducer,
  isChangeProfilePhotoReducer,
  isChangeProfilePasswordReducer,
} from "./features/users/states/reducer";
import {
  lostFoundsReducer,
  lostFoundReducer,
  isLostFoundReducer,
  lostFoundStatsReducer,
  isLostFoundAddReducer,
  isLostFoundAddedReducer,
  isLostFoundChangeReducer,
  isLostFoundChangedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundDeleteReducer,
  isLostFoundDeletedReducer,
} from "./features/lost-founds/states/reducer";

export function createMockStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      isAuthLogin: isAuthLoginReducer,
      isAuthRegister: isAuthRegisterReducer,
      isAuthLogout: isAuthLogoutReducer,
      users: usersReducer,
      user: userReducer,
      profile: profileReducer,
      isProfile: isProfileReducer,
      isChangeProfile: isChangeProfileReducer,
      isChangeProfilePhoto: isChangeProfilePhotoReducer,
      isChangeProfilePassword: isChangeProfilePasswordReducer,
      lostFounds: lostFoundsReducer,
      lostFound: lostFoundReducer,
      isLostFound: isLostFoundReducer,
      lostFoundStats: lostFoundStatsReducer,
      isLostFoundAdd: isLostFoundAddReducer,
      isLostFoundAdded: isLostFoundAddedReducer,
      isLostFoundChange: isLostFoundChangeReducer,
      isLostFoundChanged: isLostFoundChangedReducer,
      isLostFoundChangeCover: isLostFoundChangeCoverReducer,
      isLostFoundChangedCover: isLostFoundChangedCoverReducer,
      isLostFoundDelete: isLostFoundDeleteReducer,
      isLostFoundDeleted: isLostFoundDeletedReducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }),
  });
}

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
