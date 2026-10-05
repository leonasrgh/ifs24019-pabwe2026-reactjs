import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import SidebarComponent from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

function activeLabels() {
  return screen
    .getAllByRole("link")
    .filter((link) => link.className.includes("bg-indigo-600"))
    .map((link) => link.textContent);
}

describe("SidebarComponent", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("should render all main navigation items with correct hrefs", () => {
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);

    expect(screen.getByText("Dashboard Laporan").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByText("Statistik").closest("a")).toHaveAttribute("href", "/#statistik");
    expect(screen.getByText("Pengguna").closest("a")).toHaveAttribute("href", "/users");
    expect(screen.getByText("Profil Saya").closest("a")).toHaveAttribute("href", "/profile");
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });

  it.each([
    ["/", "Dashboard Laporan"],
    ["/#statistik", "Statistik"],
    ["/lost-founds/5", "Dashboard Laporan"],
    ["/users", "Pengguna"],
    ["/profile", "Profil Saya"],
  ])("should mark the right item active for %s", (path, label) => {
    window.history.pushState({}, "", path);
    renderWithProviders(<SidebarComponent isSidebarOpen={false} onCloseMobile={vi.fn()} />);
    expect(activeLabels()).toEqual([label]);
  });

  it("should show backdrop on mobile and close on click / link click", () => {
    const onCloseMobile = vi.fn();
    renderWithProviders(<SidebarComponent isSidebarOpen={true} onCloseMobile={onCloseMobile} />);

    fireEvent.click(screen.getByTestId("sidebar-backdrop"));
    expect(onCloseMobile).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Profil Saya"));
    expect(onCloseMobile).toHaveBeenCalledTimes(2);
  });
});
