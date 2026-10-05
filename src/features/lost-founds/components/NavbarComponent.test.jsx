import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import NavbarComponent from "./NavbarComponent";
import { renderWithProviders } from "../../../test-utils";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("NavbarComponent", () => {
  const mockProfileWithPhoto = {
    name: "Abdullah",
    email: "abdullah@delcom.org",
    photo: "https://example.com/photo.jpg",
  };

  const mockProfileWithoutPhoto = {
    name: "Ubaid",
    email: "ubaid@delcom.org",
    photo: null,
  };

  const mockProfileEmpty = {
    name: "",
    email: "",
    photo: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render profile photo and name correctly", () => {
    const handleLogout = vi.fn();
    const onToggleSidebar = vi.fn();

    renderWithProviders(
      <NavbarComponent
        profile={mockProfileWithPhoto}
        handleLogout={handleLogout}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={false}
      />
    );

    expect(screen.getByText("Abdullah")).toBeInTheDocument();
    expect(screen.getByText("abdullah@delcom.org")).toBeInTheDocument();
  });

  it("should render avatar initial fallback when photo is null", () => {
    renderWithProviders(
      <NavbarComponent
        profile={mockProfileWithoutPhoto}
        handleLogout={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={true}
      />
    );

    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should render default Pengguna fallback when name and email are empty", () => {
    renderWithProviders(
      <NavbarComponent
        profile={mockProfileEmpty}
        handleLogout={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    expect(screen.getByText("Pengguna")).toBeInTheDocument();
  });

  it("should toggle sidebar on mobile menu button click", () => {
    const onToggleSidebar = vi.fn();
    renderWithProviders(
      <NavbarComponent
        profile={mockProfileWithPhoto}
        handleLogout={vi.fn()}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={false}
      />
    );

    const toggleBtn = screen.getByTestId("toggle-sidebar-btn");
    fireEvent.click(toggleBtn);
    expect(onToggleSidebar).toHaveBeenCalled();
  });

  it("should open and close profile dropdown menu, navigate to profile and call logout", () => {
    const handleLogout = vi.fn();
    renderWithProviders(
      <NavbarComponent
        profile={mockProfileWithPhoto}
        handleLogout={handleLogout}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    const dropdownBtn = screen.getByTestId("profile-dropdown-button");
    fireEvent.click(dropdownBtn);
    expect(screen.getByTestId("profile-dropdown-menu")).toBeInTheDocument();

    // Click profile link in dropdown
    const profileLink = screen.getByTestId("dropdown-profile-link");
    fireEvent.click(profileLink);
    expect(mockNavigate).toHaveBeenCalledWith("/profile");

    // Open again to click logout
    fireEvent.click(dropdownBtn);
    const logoutBtn = screen.getByTestId("dropdown-logout-button");
    fireEvent.click(logoutBtn);
    expect(handleLogout).toHaveBeenCalled();
  });

  it("should close dropdown when clicking outside", () => {
    renderWithProviders(
      <NavbarComponent
        profile={mockProfileWithPhoto}
        handleLogout={vi.fn()}
        onToggleSidebar={vi.fn()}
        isSidebarOpen={false}
      />
    );

    const dropdownBtn = screen.getByTestId("profile-dropdown-button");
    fireEvent.click(dropdownBtn);
    expect(screen.getByTestId("profile-dropdown-menu")).toBeInTheDocument();

    // Simulate clicking outside
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("profile-dropdown-menu")).not.toBeInTheDocument();

    // Simulate clicking inside without closing
    fireEvent.click(dropdownBtn);
    fireEvent.mouseDown(dropdownBtn);
  });
});
