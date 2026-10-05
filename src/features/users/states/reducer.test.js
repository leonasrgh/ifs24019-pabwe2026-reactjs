import { describe, it, expect } from "vitest";
import {
  usersReducer,
  userReducer,
  profileReducer,
  isProfileReducer,
  isChangeProfileReducer,
  isChangeProfilePhotoReducer,
  isChangeProfilePasswordReducer,
} from "./reducer";
import { ActionType } from "./action";

describe("users reducer", () => {
  it("should return the default state for unknown actions", () => {
    expect(usersReducer(undefined, {})).toEqual([]);
    expect(userReducer(undefined, {})).toBeNull();
    expect(profileReducer(undefined, {})).toBeNull();
    expect(isProfileReducer(undefined, {})).toBe(false);
    expect(isChangeProfileReducer(undefined, {})).toBe(false);
    expect(isChangeProfilePhotoReducer(undefined, {})).toBe(false);
    expect(isChangeProfilePasswordReducer(undefined, {})).toBe(false);
  });

  it("should handle SET_USERS", () => {
    const action = { type: ActionType.SET_USERS, payload: [{ id: 1 }] };
    expect(usersReducer([], action)).toEqual([{ id: 1 }]);
  });

  it("should handle SET_USER", () => {
    const action = { type: ActionType.SET_USER, payload: { id: 1 } };
    expect(userReducer(null, action)).toEqual({ id: 1 });
  });

  it("should handle SET_PROFILE", () => {
    const action = { type: ActionType.SET_PROFILE, payload: { id: 2 } };
    expect(profileReducer(null, action)).toEqual({ id: 2 });
  });

  it("should handle SET_IS_PROFILE", () => {
    const action = { type: ActionType.SET_IS_PROFILE, payload: true };
    expect(isProfileReducer(false, action)).toBe(true);
  });

  it("should handle SET_IS_CHANGE_PROFILE", () => {
    const action = { type: ActionType.SET_IS_CHANGE_PROFILE, payload: true };
    expect(isChangeProfileReducer(false, action)).toBe(true);
  });

  it("should handle SET_IS_CHANGE_PROFILE_PHOTO", () => {
    const action = { type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO, payload: true };
    expect(isChangeProfilePhotoReducer(false, action)).toBe(true);
  });

  it("should handle SET_IS_CHANGE_PROFILE_PASSWORD", () => {
    const action = {
      type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
      payload: true,
    };
    expect(isChangeProfilePasswordReducer(false, action)).toBe(true);
  });
});
