import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import HomePage from "./HomePage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => mockNavigate };
});

const noopThunk = () => () => Promise.resolve();

const profile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
const items = [
  {
    id: 1, user_id: 1, title: "Dompet Hitam", description: "Hilang di kantin",
    status: "lost", is_completed: 0, cover: "img/lost-founds/cover/1.png",
    created_at: "2024-02-28T07:49:32.000000Z", author: { name: "Abdullah", photo: null },
  },
  {
    id: 2, user_id: 2, title: "Kunci Motor", description: "Ditemukan di parkiran",
    status: "found", is_completed: 1, cover: null,
    created_at: "2024-02-28T07:50:37.000000Z", author: { name: "Budi", photo: null },
  },
  {
    id: 3, user_id: 3, title: null, description: null,
    status: "lost", is_completed: 1, cover: null,
    created_at: "2024-02-29T07:50:37.000000Z", author: null,
  },
];

function renderPage(preloadedState = {}) {
  return renderWithProviders(<HomePage />, {
    preloadedState: { profile, lostFounds: items, lostFoundStats: null, ...preloadedState },
  });
}

describe("HomePage", () => {
  let listSpy;
  let statsSpy;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
    window.history.pushState({}, "", "/");
    listSpy = vi.spyOn(lostFoundAction, "asyncSetLostFounds").mockImplementation(noopThunk);
    statsSpy = vi.spyOn(lostFoundAction, "asyncSetLostFoundStats").mockImplementation(noopThunk);
  });

  it("should render nothing when profile is missing", () => {
    const { container } = renderPage({ profile: null });
    expect(container.firstChild).toBeNull();
  });

  it("should load all reports and daily stats on mount", async () => {
    renderPage();
    await waitFor(() => expect(listSpy).toHaveBeenCalledWith({ isMe: false }));
    expect(statsSpy).toHaveBeenCalledWith("daily");
  });

  it("should show metric cards computed from the loaded reports", async () => {
    renderPage();
    expect(screen.getByTestId("stat-total")).toHaveTextContent("3");
    expect(screen.getByTestId("stat-lost")).toHaveTextContent("2");
    expect(screen.getByTestId("stat-found")).toHaveTextContent("1");
    expect(screen.getByTestId("stat-completed")).toHaveTextContent("2");
    await act(async () => {});
  });

  it("should render rows with type, status, author, cover and fallbacks", async () => {
    renderPage();
    await act(async () => {});

    const row1 = screen.getByTestId("lost-found-row-1");
    expect(row1).toHaveTextContent("Dompet Hitam");
    expect(row1).toHaveTextContent("Hilang");
    expect(row1).toHaveTextContent("Proses");
    expect(row1).toHaveTextContent("Abdullah");
    expect(row1.querySelector("img")).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/img/lost-founds/cover/1.png"
    );

    const row2 = screen.getByTestId("lost-found-row-2");
    expect(row2).toHaveTextContent("Ditemukan");
    expect(row2).toHaveTextContent("Selesai");
    expect(row2.querySelector("img")).toBeNull();

    const row3 = screen.getByTestId("lost-found-row-3");
    expect(row3).toHaveTextContent("-");
  });

  it("should show loading indicator while loading and empty state when no data", async () => {
    listSpy.mockImplementation(() => () => new Promise(() => {}));
    const { unmount } = renderPage({ lostFounds: [] });
    expect(await screen.findByText("Memuat laporan...")).toBeInTheDocument();
    unmount();

    listSpy.mockImplementation(noopThunk);
    renderPage({ lostFounds: [] });
    await waitFor(() => expect(screen.getByText("Belum ada laporan yang cocok.")).toBeInTheDocument());
  });

  it("should live-search by title and description, tolerating null fields", async () => {
    renderPage();
    await act(async () => {});
    const search = screen.getByTestId("search-lost-found-input");

    fireEvent.change(search, { target: { value: "dompet" } });
    expect(screen.getByTestId("lost-found-row-1")).toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-row-2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-row-3")).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "PARKIRAN" } });
    expect(screen.getByTestId("lost-found-row-2")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "tidak ada" } });
    expect(screen.getByText("Belum ada laporan yang cocok.")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "   " } });
    expect(screen.getByTestId("lost-found-row-1")).toBeInTheDocument();
  });

  it("should filter by report type and completion status", async () => {
    renderPage();
    await act(async () => {});

    fireEvent.click(screen.getByTestId("filter-status-found-btn"));
    expect(screen.getByTestId("lost-found-row-2")).toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-row-1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-status-lost-btn"));
    expect(screen.getByTestId("lost-found-row-1")).toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-row-2")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("filter-status-all-btn"));
    fireEvent.change(screen.getByTestId("filter-completed-select"), { target: { value: "1" } });
    expect(screen.queryByTestId("lost-found-row-1")).not.toBeInTheDocument();
    expect(screen.getByTestId("lost-found-row-2")).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("filter-completed-select"), { target: { value: "0" } });
    expect(screen.getByTestId("lost-found-row-1")).toBeInTheDocument();
    expect(screen.queryByTestId("lost-found-row-2")).not.toBeInTheDocument();
  });

  it("should switch between all reports and my reports", async () => {
    renderPage();
    await act(async () => {});

    fireEvent.click(screen.getByTestId("scope-me-btn"));
    await waitFor(() => expect(listSpy).toHaveBeenLastCalledWith({ isMe: true }));

    fireEvent.click(screen.getByTestId("scope-all-btn"));
    await waitFor(() => expect(listSpy).toHaveBeenLastCalledWith({ isMe: false }));
  });

  it("should navigate to the detail page", async () => {
    renderPage();
    await act(async () => {});
    fireEvent.click(screen.getByTestId("view-lost-found-1"));
    expect(mockNavigate).toHaveBeenCalledWith("/lost-founds/1");
  });

  it("should open the add modal and close it", async () => {
    renderPage();
    await act(async () => {});

    expect(screen.queryByTestId("add-lost-found-modal")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("add-lost-found-btn"));
    expect(screen.getByTestId("add-lost-found-modal")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    expect(screen.queryByTestId("add-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should open the edit modal with the selected report and close it", async () => {
    renderPage();
    await act(async () => {});

    fireEvent.click(screen.getByTestId("edit-lost-found-2"));
    expect(screen.getByTestId("edit-lost-found-modal")).toBeInTheDocument();
    expect(screen.getByTestId("edit-lost-found-title-input")).toHaveValue("Kunci Motor");

    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should reload reports and stats after add/change succeeded", async () => {
    renderPage({ isLostFoundAdd: true, isLostFoundAdded: true });
    await waitFor(() => expect(listSpy.mock.calls.length).toBeGreaterThanOrEqual(2));
    expect(statsSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("should reload after an edit from the modal succeeded", async () => {
    const { store } = renderPage();
    await act(async () => {});
    fireEvent.click(screen.getByTestId("edit-lost-found-1"));
    const before = listSpy.mock.calls.length;

    await act(async () => {
      store.dispatch(lostFoundAction.setIsLostFoundChangedActionCreator(true));
      store.dispatch(lostFoundAction.setIsLostFoundChangeActionCreator(true));
    });

    await waitFor(() => expect(listSpy.mock.calls.length).toBeGreaterThan(before));
    expect(screen.queryByTestId("edit-lost-found-modal")).not.toBeInTheDocument();
  });

  it("should delete after confirmation and skip when cancelled", async () => {
    const deleteSpy = vi.spyOn(lostFoundAction, "asyncSetIsLostFoundDelete").mockImplementation(noopThunk);
    const confirm = vi.spyOn(toolsHelper, "showConfirmDialog");
    renderPage();
    await act(async () => {});

    confirm.mockResolvedValueOnce({ isConfirmed: false });
    fireEvent.click(screen.getByTestId("delete-lost-found-1"));
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
    expect(deleteSpy).not.toHaveBeenCalled();

    confirm.mockResolvedValueOnce({ isConfirmed: true });
    fireEvent.click(screen.getByTestId("delete-lost-found-1"));
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith(1));
  });

  it("should reload reports and stats after a successful delete", async () => {
    const { store } = renderPage({ isLostFoundDelete: true, isLostFoundDeleted: true });
    await waitFor(() => expect(listSpy.mock.calls.length).toBeGreaterThanOrEqual(2));
    expect(store.getState().isLostFoundDelete).toBe(false);
    expect(store.getState().isLostFoundDeleted).toBe(false);
  });

  it("should not reload when delete finished but failed", async () => {
    const { store } = renderPage({ isLostFoundDelete: true, isLostFoundDeleted: false });
    await act(async () => {});
    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(store.getState().isLostFoundDelete).toBe(false);
  });

  describe("statistics", () => {
    it("should show empty message when there are no stats", async () => {
      renderPage({ lostFoundStats: null });
      expect(screen.getByTestId("stats-empty")).toBeInTheDocument();
      await act(async () => {});
    });

    it("should show empty message when stats have no series", async () => {
      renderPage({ lostFoundStats: {} });
      expect(screen.getByTestId("stats-empty")).toBeInTheDocument();
      await act(async () => {});
    });

    it("should render rows, defaulting missing found series and values to zero", async () => {
      renderPage({
        lostFoundStats: {
          stats_losts: { "01-10-2024": 4, "02-10-2024": 0, "03-10-2024": null },
          stats_founds: { "01-10-2024": 2 },
        },
      });
      expect(screen.getByTestId("stats-row-01-10-2024")).toHaveTextContent("4");
      expect(screen.getByTestId("stats-row-01-10-2024")).toHaveTextContent("2");
      expect(screen.getByTestId("stats-row-02-10-2024")).toHaveTextContent("0");
      expect(screen.getByTestId("stats-row-03-10-2024")).toHaveTextContent("0");
      await act(async () => {});
    });

    it("should render rows when found series is absent entirely", async () => {
      renderPage({ lostFoundStats: { stats_losts: { "10-2024": 1 } } });
      expect(screen.getByTestId("stats-row-10-2024")).toBeInTheDocument();
      await act(async () => {});
    });

    it("should switch between daily and monthly periods", async () => {
      renderPage();
      await act(async () => {});

      fireEvent.click(screen.getByTestId("stats-monthly-btn"));
      await waitFor(() => expect(statsSpy).toHaveBeenLastCalledWith("monthly"));

      fireEvent.click(screen.getByTestId("stats-daily-btn"));
      await waitFor(() => expect(statsSpy).toHaveBeenLastCalledWith("daily"));
    });

    it("should scroll to the statistics section when hash is #statistik", async () => {
      const scroll = vi.fn();
      Element.prototype.scrollIntoView = scroll;
      window.history.pushState({}, "", "/#statistik");
      renderPage();
      await act(async () => {});
      expect(scroll).toHaveBeenCalledWith({ behavior: "smooth" });
      delete Element.prototype.scrollIntoView;
    });

    it("should not crash when scrollIntoView is unavailable or element is missing", async () => {
      window.history.pushState({}, "", "/#statistik");
      const { unmount } = renderPage();
      await act(async () => {});
      unmount();

      renderPage({ profile: null });
      await act(async () => {});
    });
  });

  it("should not update loading state after unmount", async () => {
    let resolveLoad = () => {};
    listSpy.mockImplementation(
      () => () => new Promise((resolve) => { resolveLoad = resolve; })
    );
    const { unmount } = renderPage();
    unmount();
    await act(async () => {
      resolveLoad();
    });
    expect(listSpy).toHaveBeenCalled();
  });
});
