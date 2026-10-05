import apiHelper from "../../../helpers/apiHelper";
import {
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import authApi from "../api/authApi";

export const ActionType = {
  SET_IS_AUTH_LOGIN: "SET_IS_AUTH_LOGIN",
  SET_IS_AUTH_REGISTER: "SET_IS_AUTH_REGISTER",
  SET_IS_AUTH_LOGOUT: "SET_IS_AUTH_LOGOUT",
};

// Login
export function setIsAuthLoginActionCreator(isAuthLogin) {
  return {
    type: ActionType.SET_IS_AUTH_LOGIN,
    payload: isAuthLogin,
  };
}

export function asyncSetIsAuthLogin(email, password) {
  return async (dispatch) => {
    try {
      const data = await authApi.postLogin(email, password);
      apiHelper.putAccessToken(data.token);
      dispatch(setIsAuthLoginActionCreator(true));
    } catch (error) {
      dispatch(setIsAuthLoginActionCreator(false));
      showErrorDialog(error.message);
    }
  };
}

// Register
export function setIsAuthRegisterActionCreator(isAuthRegister) {
  return {
    type: ActionType.SET_IS_AUTH_REGISTER,
    payload: isAuthRegister,
  };
}

export function asyncSetIsAuthRegister(name, email, password) {
  return async (dispatch) => {
    try {
      const message = await authApi.postRegister(name, email, password);
      dispatch(setIsAuthRegisterActionCreator(true));
      showSuccessDialog(message);
    } catch (error) {
      dispatch(setIsAuthRegisterActionCreator(false));
      showErrorDialog(error.message);
    }
  };
}

// Logout
export function setIsAuthLogoutActionCreator(isAuthLogout) {
  return {
    type: ActionType.SET_IS_AUTH_LOGOUT,
    payload: isAuthLogout,
  };
}

export function asyncSetIsAuthLogout() {
  return async (dispatch) => {
    try {
      await authApi.postLogout();
    } catch (error) {
      // Still proceed with clearing token locally even if server error
    } finally {
      apiHelper.putAccessToken("");
      dispatch(setIsAuthLogoutActionCreator(true));
    }
  };
}
