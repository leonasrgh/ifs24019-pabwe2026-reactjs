import { ActionType } from "./action";

export const isAuthLoginReducer = (state = false, action = {}) => {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_LOGIN:
      return action.payload;
    default:
      return state;
  }
};

export const isAuthRegisterReducer = (state = false, action = {}) => {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_REGISTER:
      return action.payload;
    default:
      return state;
  }
};

export const isAuthLogoutReducer = (state = false, action = {}) => {
  switch (action.type) {
    case ActionType.SET_IS_AUTH_LOGOUT:
      return action.payload;
    default:
      return state;
  }
};
