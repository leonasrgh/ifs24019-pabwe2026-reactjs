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

const store = configureStore({
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
});

export default store;
