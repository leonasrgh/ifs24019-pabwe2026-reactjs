import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setIsAuthLoginActionCreator,
  setIsAuthRegisterActionCreator,
  setIsAuthLogoutActionCreator,
  asyncSetIsAuthLogin,
  asyncSetIsAuthRegister,
  asyncSetIsAuthLogout,
} from "./action";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("auth action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create correct action objects", () => {
    expect(setIsAuthLoginActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGIN,
      payload: true,
    });
    expect(setIsAuthRegisterActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_REGISTER,
      payload: true,
    });
    expect(setIsAuthLogoutActionCreator(true)).toEqual({
      type: ActionType.SET_IS_AUTH_LOGOUT,
      payload: true,
    });
  });

  describe("asyncSetIsAuthLogin", () => {
    it("should dispatch success and store token on successful login", async () => {
      const dispatch = vi.fn();
      vi.spyOn(authApi, "postLogin").mockResolvedValue({ token: "jwt-123" });
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

      await asyncSetIsAuthLogin("email@del.org", "password")(dispatch);

      expect(putTokenSpy).toHaveBeenCalledWith("jwt-123");
      expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(true));
    });

    it("should dispatch false and show error on login failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(authApi, "postLogin").mockRejectedValue(new Error("Login gagal"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await asyncSetIsAuthLogin("email@del.org", "wrong")(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Login gagal");
      expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(false));
    });
  });

  describe("asyncSetIsAuthRegister", () => {
    it("should dispatch success and show success dialog on registration success", async () => {
      const dispatch = vi.fn();
      vi.spyOn(authApi, "postRegister").mockResolvedValue("Registrasi Berhasil");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await asyncSetIsAuthRegister("Name", "name@del.org", "pass")(dispatch);

      expect(successSpy).toHaveBeenCalledWith("Registrasi Berhasil");
      expect(dispatch).toHaveBeenCalledWith(setIsAuthRegisterActionCreator(true));
    });

    it("should dispatch false and show error dialog on registration failure", async () => {
      const dispatch = vi.fn();
      vi.spyOn(authApi, "postRegister").mockRejectedValue(new Error("Email sudah terdaftar"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await asyncSetIsAuthRegister("Name", "name@del.org", "pass")(dispatch);

      expect(errorSpy).toHaveBeenCalledWith("Email sudah terdaftar");
      expect(dispatch).toHaveBeenCalledWith(setIsAuthRegisterActionCreator(false));
    });
  });

  describe("asyncSetIsAuthLogout", () => {
    it("should clear token and dispatch logout action when logout succeeds", async () => {
      const dispatch = vi.fn();
      vi.spyOn(authApi, "postLogout").mockResolvedValue("Berhasil logout");
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

      await asyncSetIsAuthLogout()(dispatch);

      expect(putTokenSpy).toHaveBeenCalledWith("");
      expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(true));
    });

    it("should still clear token and dispatch logout action even if api throws error", async () => {
      const dispatch = vi.fn();
      vi.spyOn(authApi, "postLogout").mockRejectedValue(new Error("Network fail"));
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

      await asyncSetIsAuthLogout()(dispatch);

      expect(putTokenSpy).toHaveBeenCalledWith("");
      expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(true));
    });
  });
});
