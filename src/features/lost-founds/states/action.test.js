import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ActionType,
  setLostFoundsActionCreator,
  asyncSetLostFounds,
  setLostFoundActionCreator,
  setIsLostFoundActionCreator,
  asyncSetLostFound,
  setLostFoundStatsActionCreator,
  asyncSetLostFoundStats,
  setIsLostFoundAddActionCreator,
  setIsLostFoundAddedActionCreator,
  setIsLostFoundChangeActionCreator,
  setIsLostFoundChangedActionCreator,
  setIsLostFoundChangeCoverActionCreator,
  setIsLostFoundChangedCoverActionCreator,
  setIsLostFoundDeleteActionCreator,
  setIsLostFoundDeletedActionCreator,
  asyncSetIsLostFoundAdd,
  asyncSetIsLostFoundChange,
  asyncSetIsLostFoundChangeCover,
  asyncSetIsLostFoundDelete,
} from "./action";
import lostFoundApi from "../api/lostFoundApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const silent = () => Promise.resolve({});

describe("lost-founds action", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("action creators", () => {
    it("should create list, detail, flag and stats actions", () => {
      expect(setLostFoundsActionCreator([{ id: 1 }])).toEqual({ type: ActionType.SET_LOST_FOUNDS, payload: [{ id: 1 }] });
      expect(setLostFoundActionCreator({ id: 1 })).toEqual({ type: ActionType.SET_LOST_FOUND, payload: { id: 1 } });
      expect(setIsLostFoundActionCreator(true)).toEqual({ type: ActionType.SET_IS_LOST_FOUND, payload: true });
      expect(setLostFoundStatsActionCreator({ a: 1 })).toEqual({ type: ActionType.SET_LOST_FOUND_STATS, payload: { a: 1 } });
    });

    it.each([
    ["Add", setIsLostFoundAddActionCreator, ActionType.SET_IS_LOST_FOUND_ADD],
    ["Added", setIsLostFoundAddedActionCreator, ActionType.SET_IS_LOST_FOUND_ADDED],
    ["Change", setIsLostFoundChangeActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGE],
    ["Changed", setIsLostFoundChangedActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGED],
    ["ChangeCover", setIsLostFoundChangeCoverActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGE_COVER],
    ["ChangedCover", setIsLostFoundChangedCoverActionCreator, ActionType.SET_IS_LOST_FOUND_CHANGED_COVER],
    ["Delete", setIsLostFoundDeleteActionCreator, ActionType.SET_IS_LOST_FOUND_DELETE],
    ["Deleted", setIsLostFoundDeletedActionCreator, ActionType.SET_IS_LOST_FOUND_DELETED],
    ])("should create %s action", (_name, creator, type) => {
      expect(creator(true)).toEqual({ type, payload: true });
      expect(creator(false)).toEqual({ type, payload: false });
    });
  });

  describe("asyncSetLostFounds", () => {
    it("should pass filters to API and dispatch the list", async () => {
      const spy = vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue([{ id: 1 }]);
      const dispatch = vi.fn();
      await asyncSetLostFounds({ isMe: true })(dispatch);
      expect(spy).toHaveBeenCalledWith({ isMe: true });
      expect(dispatch).toHaveBeenCalledWith(setLostFoundsActionCreator([{ id: 1 }]));
    });

    it("should default to empty filters", async () => {
      const spy = vi.spyOn(lostFoundApi, "getLostFounds").mockResolvedValue([]);
      await asyncSetLostFounds()(vi.fn());
      expect(spy).toHaveBeenCalledWith({});
    });

    it("should dispatch empty list when request fails", async () => {
      vi.spyOn(lostFoundApi, "getLostFounds").mockRejectedValue(new Error("fail"));
      const dispatch = vi.fn();
      await asyncSetLostFounds()(dispatch);
      expect(dispatch).toHaveBeenCalledWith(setLostFoundsActionCreator([]));
    });
  });

  describe("asyncSetLostFound", () => {
    it("should dispatch detail and flag on success", async () => {
      vi.spyOn(lostFoundApi, "getLostFoundById").mockResolvedValue({ id: 7 });
      const dispatch = vi.fn();
      await asyncSetLostFound(7)(dispatch);
      expect(dispatch).toHaveBeenNthCalledWith(1, setLostFoundActionCreator({ id: 7 }));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsLostFoundActionCreator(true));
    });

    it("should dispatch null and flag on failure", async () => {
      vi.spyOn(lostFoundApi, "getLostFoundById").mockRejectedValue(new Error("fail"));
      const dispatch = vi.fn();
      await asyncSetLostFound(7)(dispatch);
      expect(dispatch).toHaveBeenNthCalledWith(1, setLostFoundActionCreator(null));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsLostFoundActionCreator(true));
    });
  });

  describe("asyncSetLostFoundStats", () => {
    it("should dispatch stats for the given period", async () => {
      const spy = vi.spyOn(lostFoundApi, "getStats").mockResolvedValue({ stats_losts: {} });
      const dispatch = vi.fn();
      await asyncSetLostFoundStats("monthly", { totalData: 3 })(dispatch);
      expect(spy).toHaveBeenCalledWith("monthly", { totalData: 3 });
      expect(dispatch).toHaveBeenCalledWith(setLostFoundStatsActionCreator({ stats_losts: {} }));
    });

    it("should default to daily and dispatch null on failure", async () => {
      const spy = vi.spyOn(lostFoundApi, "getStats").mockRejectedValue(new Error("fail"));
      const dispatch = vi.fn();
      await asyncSetLostFoundStats()(dispatch);
      expect(spy).toHaveBeenCalledWith("daily", {});
      expect(dispatch).toHaveBeenCalledWith(setLostFoundStatsActionCreator(null));
    });
  });

  describe("asyncSetIsLostFoundAdd", () => {
    it("should show success dialog and flag added", async () => {
      const spy = vi.spyOn(lostFoundApi, "postLostFound").mockResolvedValue({ lost_found_id: 1 });
      const success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(silent);
      const dispatch = vi.fn();
      await asyncSetIsLostFoundAdd("T", "D", "lost")(dispatch);
      expect(spy).toHaveBeenCalledWith("T", "D", "lost");
      expect(success).toHaveBeenCalledWith("Laporan berhasil ditambahkan!");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsLostFoundAddedActionCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsLostFoundAddActionCreator(true));
    });

    it("should show error dialog and flag not added on failure", async () => {
      vi.spyOn(lostFoundApi, "postLostFound").mockRejectedValue(new Error("Data tidak valid"));
      const error = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(silent);
      const dispatch = vi.fn();
      await asyncSetIsLostFoundAdd("", "", "lost")(dispatch);
      expect(error).toHaveBeenCalledWith("Data tidak valid");
      expect(dispatch).toHaveBeenNthCalledWith(1, setIsLostFoundAddedActionCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, setIsLostFoundAddActionCreator(true));
    });
  });

  describe.each([
    ["asyncSetIsLostFoundChange", asyncSetIsLostFoundChange, "putLostFound", [1, "T", "D", "lost", false], "Laporan berhasil diperbarui!", setIsLostFoundChangedActionCreator, setIsLostFoundChangeActionCreator],
    ["asyncSetIsLostFoundChangeCover", asyncSetIsLostFoundChangeCover, "postLostFoundCover", [1, new File(["x"], "c.jpg")], "Cover berhasil diperbarui!", setIsLostFoundChangedCoverActionCreator, setIsLostFoundChangeCoverActionCreator],
    ["asyncSetIsLostFoundDelete", asyncSetIsLostFoundDelete, "deleteLostFound", [1], "Laporan berhasil dihapus!", setIsLostFoundDeletedActionCreator, setIsLostFoundDeleteActionCreator],
  ])("%s", (_name, thunk, apiFn, args, defaultMessage, doneCreator, finishCreator) => {
    it("should show API message and flag done on success", async () => {
      vi.spyOn(lostFoundApi, apiFn).mockResolvedValue("Pesan API");
      const success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(silent);
      const dispatch = vi.fn();
      await thunk(...args)(dispatch);
      expect(success).toHaveBeenCalledWith("Pesan API");
      expect(dispatch).toHaveBeenNthCalledWith(1, doneCreator(true));
      expect(dispatch).toHaveBeenNthCalledWith(2, finishCreator(true));
    });

    it("should use default message when API message is empty", async () => {
      vi.spyOn(lostFoundApi, apiFn).mockResolvedValue(undefined);
      const success = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(silent);
      await thunk(...args)(vi.fn());
      expect(success).toHaveBeenCalledWith(defaultMessage);
    });

    it("should show error dialog and flag failure when request fails", async () => {
      vi.spyOn(lostFoundApi, apiFn).mockRejectedValue(new Error("Gagal"));
      const error = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(silent);
      const dispatch = vi.fn();
      await thunk(...args)(dispatch);
      expect(error).toHaveBeenCalledWith("Gagal");
      expect(dispatch).toHaveBeenNthCalledWith(1, doneCreator(false));
      expect(dispatch).toHaveBeenNthCalledWith(2, finishCreator(true));
    });
  });
});
