import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import NotFoundPage from "./NotFoundPage";
import { renderWithProviders } from "../../../test-utils";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("NotFoundPage", () => {
  it("should render 404 text and description properly", () => {
    renderWithProviders(<NotFoundPage />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Halaman Tidak Ditemukan")).toBeInTheDocument();
    expect(
      screen.getByText(/Maaf, rute atau halaman yang Anda cari tidak tersedia/i)
    ).toBeInTheDocument();
  });

  it("should navigate back when Kembali button is clicked", () => {
    renderWithProviders(<NotFoundPage />);

    const backButton = screen.getByTestId("back-btn");
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it("should navigate to home when Ke Halaman Utama button is clicked", () => {
    renderWithProviders(<NotFoundPage />);

    const homeButton = screen.getByTestId("home-btn");
    fireEvent.click(homeButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
