import { ActionType } from "./action";

export const usersReducer = (state = [], action = {}) => {
  switch (action.type) {
    case ActionType.SET_USERS:
      return action.payload;
    default:
      return state;
  }
};

export const userReducer = (state = null, action = {}) => {
  switch (action.type) {
    case ActionType.SET_USER:
      return action.payload;
    default:
      return state;
  }
};

export const profileReducer = (state = null, action = {}) => {
  switch (action.type) {
    case ActionType.SET_PROFILE:
      return action.payload;
    default:
      return state;
  }
};

export const isProfileReducer = (state = false, action = {}) => {
  switch (action.type) {
    case ActionType.SET_IS_PROFILE:
      return action.payload;
    default:
      return state;
  }
};

export const isChangeProfileReducer = (state = false, action = {}) => {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE:
      return action.payload;
    default:
      return state;
  }
};

export const isChangeProfilePhotoReducer = (state = false, action = {}) => {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE_PHOTO:
      return action.payload;
    default:
      return state;
  }
};

export const isChangeProfilePasswordReducer = (state = false, action = {}) => {
  switch (action.type) {
    case ActionType.SET_IS_CHANGE_PROFILE_PASSWORD:
      return action.payload;
    default:
      return state;
  }
};
