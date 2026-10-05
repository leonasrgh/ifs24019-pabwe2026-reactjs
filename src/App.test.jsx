import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import App from "./App";
import { renderWithProviders } from "./test-utils";

describe("App Component", () => {
  it("should render application without crashing", () => {
    const { container } = renderWithProviders(<App />);
    expect(container).toBeDefined();
  });

  it("should render the login page on /auth/login with required selectors", () => {
    window.history.pushState({}, "Login", "/auth/login");
    const { container } = renderWithProviders(<App />);
    expect(container.querySelector("#login-email-input")).toBeInTheDocument();
    expect(container.querySelector("#login-password-input")).toBeInTheDocument();
    expect(container.querySelector("#login-submit-button")).toBeInTheDocument();
  });

  it("should render the register page on /auth/register", () => {
    window.history.pushState({}, "Register", "/auth/register");
    const { container } = renderWithProviders(<App />);
    expect(container.querySelector("form")).toBeInTheDocument();
  });

  it("should render 404 NotFoundPage for invalid route", () => {
    window.history.pushState({}, "Not Found", "/random-invalid-route");
    renderWithProviders(<App />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Halaman Tidak Ditemukan")).toBeInTheDocument();
  });
});

