import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setUsersActionCreator,
  setUserActionCreator,
  setProfileActionCreator,
  setIsProfile,
  setIsChangeProfileActionCreator,
  setIsChangeProfilePhotoActionCreator,
  setIsChangeProfilePasswordActionCreator,
  asyncSetUsers,
  asyncSetUserById,
  asyncSetProfile,
  asyncPutProfile,
  asyncPostProfilePhoto,
  asyncPutProfilePassword,
} from "./action";
import userApi from "../api/userApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("users action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create correct action objects", () => {
    expect(setUsersActionCreator([{ id: 1 }])).toEqual({
      type: ActionType.SET_USERS,
      payload: [{ id: 1 }],
    });
    expect(setUserActionCreator({ id: 1 })).toEqual({
      type: ActionType.SET_USER,
      payload: { id: 1 },
    });
    expect(setProfileActionCreator({ id: 1 })).toEqual({
      type: ActionType.SET_PROFILE,
      payload: { id: 1 },
    });
    expect(setIsProfile(true)).toEqual({
      type: ActionType.SET_IS_PROFILE,
      payload: true,
    });
    expect(setIsChangeProfileActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE,
      payload: true,
    });
    expect(setIsChangeProfilePhotoActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO,
      payload: true,
    });
    expect(setIsChangeProfilePasswordActionCreator(true)).toEqual({
      type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD,
      payload: true,
    });
  });

  describe("asyncSetUsers", () => {
    it("should dispatch setUsersActionCreator with users on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getUsers").mockResolvedValue([{ id: 1 }]);

      await asyncSetUsers()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUsersActionCreator([{ id: 1 }]));
    });

    it("should dispatch empty array on error", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getUsers").mockRejectedValue(new Error("Error"));

      await asyncSetUsers()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUsersActionCreator([]));
    });
  });

  describe("asyncSetUserById", () => {
    it("should dispatch setUserActionCreator with user on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getUserById").mockResolvedValue({ id: 2 });

      await asyncSetUserById(2)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUserActionCreator({ id: 2 }));
    });

    it("should dispatch null on error", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getUserById").mockRejectedValue(new Error("Error"));

      await asyncSetUserById(99)(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setUserActionCreator(null));
    });
  });

  describe("asyncSetProfile", () => {
    it("should dispatch setProfileActionCreator and setIsProfile on success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getProfile").mockResolvedValue({ id: 3 });

      await asyncSetProfile()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator({ id: 3 }));
      expect(dispatch).toHaveBeenCalledWith(setIsProfile(true));
    });

    it("should dispatch null and setIsProfile on error", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "getProfile").mockRejectedValue(new Error("Failed"));

      await asyncSetProfile()(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator(null));
      expect(dispatch).toHaveBeenCalledWith(setIsProfile(true));
    });
  });

  describe("asyncPutProfile", () => {
    it("should update profile, show success and dispatch actions on success", async () => {
      const dispatch = vi.fn();
      const updated = { id: 1, name: "New Name", email: "new@del.org" };
      vi.spyOn(userApi, "putProfile").mockResolvedValue(updated);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await asyncPutProfile("New Name", "new@del.org")(dispatch);

      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator(updated));
      expect(successSpy).toHaveBeenCalledWith("Profil berhasil diperbarui!");
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfileActionCreator(true));
    });

    it("should show error dialog and dispatch false on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "putProfile").mockRejectedValue(new Error("Gagal update"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await asyncPutProfile("New Name", "new@del.org")(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Gagal update");
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfileActionCreator(false));
    });
  });

  describe("asyncPostProfilePhoto", () => {
    it("should upload photo, refresh profile, and show success dialog", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "postProfilePhoto").mockResolvedValue("Foto profil diubah");
      vi.spyOn(userApi, "getProfile").mockResolvedValue({ id: 1, photo: "new.jpg" });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "test.png");
      await asyncPostProfilePhoto(dummyFile)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Foto profil diubah");
      expect(dispatch).toHaveBeenCalledWith(setProfileActionCreator({ id: 1, photo: "new.jpg" }));
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfilePhotoActionCreator(true));
    });

    it("should use fallback message in success dialog if message empty", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "postProfilePhoto").mockResolvedValue("");
      vi.spyOn(userApi, "getProfile").mockResolvedValue({ id: 1 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "test.png");
      await asyncPostProfilePhoto(dummyFile)(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Foto profil berhasil diperbarui!");
    });

    it("should show error dialog and dispatch false on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "postProfilePhoto").mockRejectedValue(new Error("File terlalu besar"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "test.png");
      await asyncPostProfilePhoto(dummyFile)(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("File terlalu besar");
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfilePhotoActionCreator(false));
    });
  });

  describe("asyncPutProfilePassword", () => {
    it("should update password, show success dialog, and dispatch true", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "putProfilePassword").mockResolvedValue("Password diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await asyncPutProfilePassword("old", "new", "new")(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Password diubah");
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfilePasswordActionCreator(true));
    });

    it("should use fallback message if server message empty", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "putProfilePassword").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await asyncPutProfilePassword("old", "new", "new")(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Kata sandi berhasil diperbarui!");
    });

    it("should show error dialog and dispatch false on failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(userApi, "putProfilePassword").mockRejectedValue(new Error("Password salah"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await asyncPutProfilePassword("old", "new", "new")(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Password salah");
      expect(dispatch).toHaveBeenCalledWith(setIsChangeProfilePasswordActionCreator(false));
    });
  });
});
