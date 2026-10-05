import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import DetailPage from "./DetailPage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: "5" }) };
});

const noopThunk = () => () => Promise.resolve();
const profile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
const report = {
  id: 5, user_id: 1, title: "Dompet Hitam", description: "Hilang di kantin",
  status: "lost", is_completed: 0, cover: "img/lost-founds/cover/5.png",
  created_at: "2024-02-28T07:49:32.000000Z", author: { name: "Abdullah", photo: null },
};

function renderPage(state = {}) {
  return renderWithProviders(<DetailPage />, {
    preloadedState: { profile, lostFound: report, ...state },
  });
}

describe("DetailPage", () => {
  let fetchSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
    fetchSpy = vi.spyOn(lostFoundAction, "asyncSetLostFound").mockImplementation(noopThunk);
  });

  it("should show a spinner while profile or report is missing", () => {
    const first = renderPage({ profile: null });
    expect(first.container.querySelector(".animate-spin")).toBeInTheDocument();
    first.unmount();

    const second = renderPage({ lostFound: null });
    expect(second.container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should fetch the report by route id", () => {
    renderPage();
    expect(fetchSpy).toHaveBeenCalledWith("5");
  });

  it("should redirect home when load finished without a report, and stay otherwise", () => {
    const missing = renderPage({ lostFound: null, isLostFound: true });
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(missing.store.getState().isLostFound).toBe(false);
    missing.unmount();

    mockNavigate.mockClear();
    renderPage({ isLostFound: true });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should render the report details with resolved cover", () => {
    renderPage();
    expect(screen.getByTestId("detail-title")).toHaveTextContent("Dompet Hitam");
    expect(screen.getByTestId("detail-description")).toHaveTextContent("Hilang di kantin");
    expect(screen.getByTestId("detail-author")).toHaveTextContent("Abdullah");
    expect(screen.getByTestId("detail-date")).not.toHaveTextContent("-");
    expect(screen.getByTestId("detail-status-badge")).toHaveTextContent("Barang Hilang");
    expect(screen.getByTestId("detail-completed-badge")).toHaveTextContent("Dalam Proses");
    expect(screen.getByTestId("lost-found-cover-image")).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/img/lost-founds/cover/5.png"
    );
    expect(screen.getByTestId("back-to-lost-founds-link")).toHaveAttribute("href", "/");
  });

  it("should render found/completed variants, placeholder cover and default author", () => {
    renderPage({
      lostFound: { ...report, status: "found", is_completed: 1, cover: null, author: null },
    });
    expect(screen.getByTestId("detail-status-badge")).toHaveTextContent("Barang Ditemukan");
    expect(screen.getByTestId("detail-completed-badge")).toHaveTextContent("Selesai");
    expect(screen.getByTestId("lost-found-cover-placeholder")).toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-cover-image")).not.toBeInTheDocument();
    expect(screen.getByTestId("detail-author")).toHaveTextContent("Pengguna");
  });

  it("should show owner actions only for the report owner", () => {
    const owner = renderPage();
    expect(screen.getByTestId("edit-cover-btn")).toBeInTheDocument();
    expect(screen.getByTestId("edit-detail-btn")).toBeInTheDocument();
    expect(screen.getByTestId("delete-detail-btn")).toBeInTheDocument();
    owner.unmount();

    renderPage({ lostFound: { ...report, user_id: 99 } });
    expect(screen.queryByTestId("edit-cover-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-detail-btn")).not.toBeInTheDocument();
  });

  it("should open and close the cover and edit modals", () => {
    renderPage();

    fireEvent.click(screen.getByTestId("edit-cover-btn"));
    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(screen.queryByTestId("change-cover-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("edit-detail-btn"));
    expect(screen.getByTestId("edit-lost-found-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should refresh the report after the data or cover was changed", () => {
    renderPage({ isLostFoundChange: true, isLostFoundChanged: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should refresh the report after the cover was changed", () => {
    renderPage({ isLostFoundChangeCover: true, isLostFoundChangedCover: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("should delete after confirmation and skip when cancelled", async () => {
    const deleteSpy = vi.spyOn(lostFoundAction, "asyncSetIsLostFoundDelete").mockImplementation(noopThunk);
    const confirm = vi.spyOn(toolsHelper, "showConfirmDialog");
    renderPage();

    confirm.mockResolvedValueOnce({ isConfirmed: false });
    fireEvent.click(screen.getByTestId("delete-detail-btn"));
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(deleteSpy).not.toHaveBeenCalled();

    confirm.mockResolvedValueOnce({ isConfirmed: true });
    fireEvent.click(screen.getByTestId("delete-detail-btn"));
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith(5));
  });

  it("should go home after the report was deleted, and stay when deletion failed", () => {
    const ok = renderPage({ isLostFoundDelete: true, isLostFoundDeleted: true });
    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(ok.store.getState().isLostFoundDeleted).toBe(false);
    ok.unmount();

    mockNavigate.mockClear();
    renderPage({ isLostFoundDelete: true, isLostFoundDeleted: false });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should settle pending effects", async () => {
    renderPage();
    await act(async () => {});
  });
});
