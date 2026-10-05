import { describe, it, expect } from "vitest";
import {
  isAuthLoginReducer,
  isAuthRegisterReducer,
  isAuthLogoutReducer,
} from "./reducer";
import { ActionType } from "./action";

describe("auth reducer", () => {
  it("should return the initial state when unknown action given", () => {
    expect(isAuthLoginReducer(undefined, {})).toBe(false);
    expect(isAuthRegisterReducer(undefined, {})).toBe(false);
    expect(isAuthLogoutReducer(undefined, {})).toBe(false);
  });

  it("should handle SET_IS_AUTH_LOGIN", () => {
    const action = { type: ActionType.SET_IS_AUTH_LOGIN, payload: true };
    expect(isAuthLoginReducer(false, action)).toBe(true);
  });

  it("should handle SET_IS_AUTH_REGISTER", () => {
    const action = { type: ActionType.SET_IS_AUTH_REGISTER, payload: true };
    expect(isAuthRegisterReducer(false, action)).toBe(true);
  });

  it("should handle SET_IS_AUTH_LOGOUT", () => {
    const action = { type: ActionType.SET_IS_AUTH_LOGOUT, payload: true };
    expect(isAuthLogoutReducer(false, action)).toBe(true);
  });
});
