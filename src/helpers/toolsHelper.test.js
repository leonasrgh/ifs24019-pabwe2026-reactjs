import { describe, it, expect, vi } from "vitest";
import Swal from "sweetalert2";
import {
  showErrorDialog,
  showWarningDialog,
  showSuccessDialog,
  showConfirmDialog,
  formatDate,
  getImageUrl,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({
  default: {
    fire: vi.fn(),
    close: vi.fn(),
  },
}));

describe("toolsHelper", () => {
  it("should call Swal.fire for showErrorDialog and handle confirmation", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showErrorDialog("Error test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Terjadi Kesalahan",
        text: "Error test",
        icon: "error",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    // Not confirmed branch
    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await showErrorDialog("Error test");
  });

  it("should call Swal.fire for showWarningDialog and handle confirmation", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showWarningDialog("Warning test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Peringatan",
        text: "Warning test",
        icon: "warning",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await showWarningDialog("Warning test");
  });

  it("should call Swal.fire for showSuccessDialog and handle confirmation", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    await showSuccessDialog("Success test");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Tindakan Berhasil",
        text: "Success test",
        icon: "success",
      })
    );
    expect(Swal.close).toHaveBeenCalled();

    Swal.fire.mockResolvedValue({ isConfirmed: false });
    await showSuccessDialog("Success test");
  });

  it("should call Swal.fire for showConfirmDialog", async () => {
    Swal.fire.mockResolvedValue({ isConfirmed: true });
    const res = await showConfirmDialog("Confirm test?");
    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Konfirmasi",
        text: "Confirm test?",
        icon: "question",
      })
    );
    expect(res.isConfirmed).toBe(true);
  });

  it("should format date correctly or return fallback for empty date", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    const formatted = formatDate("2024-02-26T02:34:26.000000Z");
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe("string");
  });
});

describe("getImageUrl", () => {
  it("should return null when path is empty", () => {
    expect(getImageUrl(null)).toBeNull();
    expect(getImageUrl(undefined)).toBeNull();
    expect(getImageUrl("")).toBeNull();
  });

  it("should keep absolute, data and blob URLs untouched", () => {
    expect(getImageUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
    expect(getImageUrl("http://127.0.0.1:8000/img/a.jpeg")).toBe("http://127.0.0.1:8000/img/a.jpeg");
    expect(getImageUrl("data:image/png;base64,AAA")).toBe("data:image/png;base64,AAA");
    expect(getImageUrl("blob:http://localhost/abc")).toBe("blob:http://localhost/abc");
  });

  it("should resolve relative paths against the API origin", () => {
    expect(getImageUrl("img/lost-founds/cover/1_1.png")).toBe(
      "https://open-api.delcom.org/img/lost-founds/cover/1_1.png"
    );
    expect(getImageUrl("/img/lost-founds/cover/1_1.png")).toBe(
      "https://open-api.delcom.org/img/lost-founds/cover/1_1.png"
    );
  });
});
