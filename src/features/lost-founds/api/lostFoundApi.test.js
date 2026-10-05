import { describe, it, expect, vi, beforeEach } from "vitest";
import lostFoundApi from "./lostFoundApi";
import apiHelper from "../../../helpers/apiHelper";

function mockResponse(body) {
  return vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
    json: async () => body,
  });
}

describe("lostFoundApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getLostFounds", () => {
    it("should fetch all reports without filters by default", async () => {
      const spy = mockResponse({ status: "success", data: { lost_founds: [{ id: 1 }] } });
      expect(await lostFoundApi.getLostFounds()).toEqual([{ id: 1 }]);
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/lost-founds\/$/), { method: "GET" });
    });

    it("should send status, is_completed and is_me filters", async () => {
      const spy = mockResponse({ status: "success", data: { lost_founds: [] } });
      await lostFoundApi.getLostFounds({ status: "lost", isCompleted: 1, isMe: true });
      expect(spy.mock.calls[0][0]).toMatch(/\/lost-founds\/\?status=lost&is_completed=1&is_me=1$/);
    });

    it("should send is_completed=0 (falsy but valid value)", async () => {
      const spy = mockResponse({ status: "success", data: { lost_founds: [] } });
      await lostFoundApi.getLostFounds({ isCompleted: 0 });
      expect(spy.mock.calls[0][0]).toMatch(/\?is_completed=0$/);
    });

    it("should ignore null/undefined/empty is_completed", async () => {
      const spy = mockResponse({ status: "success", data: { lost_founds: [] } });
      await lostFoundApi.getLostFounds({ isCompleted: null });
      await lostFoundApi.getLostFounds({ isCompleted: undefined });
      await lostFoundApi.getLostFounds({ isCompleted: "" });
      spy.mock.calls.forEach((call) => expect(call[0]).not.toContain("?"));
    });

    it("should return empty array when data is missing", async () => {
      mockResponse({ status: "success" });
      expect(await lostFoundApi.getLostFounds()).toEqual([]);
    });

    it("should accept success flag and throw API message on failure", async () => {
      mockResponse({ success: true, data: { lost_founds: [{ id: 2 }] } });
      expect(await lostFoundApi.getLostFounds()).toEqual([{ id: 2 }]);

      mockResponse({ status: "fail", message: "Unauthenticated." });
      await expect(lostFoundApi.getLostFounds()).rejects.toThrow("Unauthenticated.");
    });

    it("should use fallback message when none is given", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.getLostFounds()).rejects.toThrow("Gagal mengambil data laporan");
    });
  });

  describe("getLostFoundById", () => {
    it("should return the report detail", async () => {
      const spy = mockResponse({ status: "success", data: { lost_found: { id: 9 } } });
      expect(await lostFoundApi.getLostFoundById(9)).toEqual({ id: 9 });
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/lost-founds\/9$/), { method: "GET" });
    });

    it("should return undefined when data is missing and throw on failure", async () => {
      mockResponse({ status: "success" });
      expect(await lostFoundApi.getLostFoundById(9)).toBeUndefined();

      mockResponse({ status: "fail" });
      await expect(lostFoundApi.getLostFoundById(9)).rejects.toThrow("Gagal mengambil detail laporan");
    });
  });

  describe("postLostFound", () => {
    it("should create a report and return data", async () => {
      const spy = mockResponse({ status: "success", data: { lost_found_id: 1 } });
      const data = await lostFoundApi.postLostFound("Dompet", "Warna hitam", "lost");
      expect(data).toEqual({ lost_found_id: 1 });
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/lost-founds\/$/), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Dompet", description: "Warna hitam", status: "lost" }),
      });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(lostFoundApi.postLostFound("", "", "lost")).rejects.toThrow("Data tidak valid");
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.postLostFound("", "", "lost")).rejects.toThrow("Gagal menambahkan laporan");
    });
  });

  describe("putLostFound", () => {
    it("should update a report with is_completed as 1/0", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah data" });

      expect(await lostFoundApi.putLostFound(1, "T", "D", "found", true)).toBe("Berhasil mengubah data");
      expect(spy.mock.calls[0][0]).toMatch(/\/lost-founds\/1$/);
      expect(spy.mock.calls[0][1].method).toBe("PUT");
      expect(JSON.parse(spy.mock.calls[0][1].body)).toEqual({
        title: "T",
        description: "D",
        status: "found",
        is_completed: 1,
      });

      await lostFoundApi.putLostFound(1, "T", "D", "lost", false);
      expect(JSON.parse(spy.mock.calls[1][1].body).is_completed).toBe(0);
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.putLostFound(1, "", "", "lost", false)).rejects.toThrow("Gagal mengubah laporan");
    });
  });

  describe("postLostFoundCover", () => {
    it("should upload cover with FormData", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah cover" });
      const file = new File(["x"], "cover.jpg", { type: "image/jpeg" });

      expect(await lostFoundApi.postLostFoundCover(1, file)).toBe("Berhasil mengubah cover");
      expect(spy.mock.calls[0][0]).toMatch(/\/lost-founds\/1\/cover$/);
      expect(spy.mock.calls[0][1].body.get("cover")).toBeInstanceOf(File);
    });

    it("should fall back to default filename and throw on failure", async () => {
      const spy = mockResponse({ status: "success", message: "ok" });
      await lostFoundApi.postLostFoundCover(2, new Blob(["x"], { type: "image/png" }));
      expect(spy.mock.calls[0][1].body.get("cover").name).toBe("cover.jpg");

      mockResponse({ status: "fail" });
      await expect(
        lostFoundApi.postLostFoundCover(1, new File(["x"], "c.png"))
      ).rejects.toThrow("Gagal mengubah cover");
    });
  });

  describe("deleteLostFound", () => {
    it("should delete a report", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil menghapus data" });
      expect(await lostFoundApi.deleteLostFound(3)).toBe("Berhasil menghapus data");
      expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\/lost-founds\/3$/), { method: "DELETE" });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail" });
      await expect(lostFoundApi.deleteLostFound(3)).rejects.toThrow("Gagal menghapus laporan");
    });
  });

  describe("getStats", () => {
    it("should fetch daily stats by default without params", async () => {
      const spy = mockResponse({ status: "success", data: { stats_losts: { a: 1 } } });
      expect(await lostFoundApi.getStats()).toEqual({ stats_losts: { a: 1 } });
      expect(spy.mock.calls[0][0]).toMatch(/\/lost-founds\/stats\/daily$/);
    });

    it("should fetch monthly stats with end_date and total_data", async () => {
      const spy = mockResponse({ status: "success", data: {} });
      await lostFoundApi.getStats("monthly", { endDate: "2024-10-05 22:00:00", totalData: 5 });
      const url = spy.mock.calls[0][0];
      expect(url).toContain("/lost-founds/stats/monthly?");
      expect(url).toContain("end_date=2024-10-05+22%3A00%3A00");
      expect(url).toContain("total_data=5");
    });

    it("should return empty object when data is missing and throw on failure", async () => {
      mockResponse({ status: "success" });
      expect(await lostFoundApi.getStats("daily")).toEqual({});

      mockResponse({ status: "fail" });
      await expect(lostFoundApi.getStats("daily")).rejects.toThrow("Gagal mengambil data statistik");
    });
  });
});
