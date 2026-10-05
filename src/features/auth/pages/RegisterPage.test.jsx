import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import RegisterPage from "./RegisterPage";
import { renderWithProviders } from "../../../test-utils";
import * as authAction from "../states/action";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render inputs and dispatch registration", async () => {
    const registerSpy = vi
      .spyOn(authAction, "asyncSetIsAuthRegister")
      .mockReturnValue(() => Promise.resolve());

    renderWithProviders(<RegisterPage />, {
      preloadedState: {
        isAuthRegister: false,
      },
    });

    const nameInput = screen.getByTestId("register-name-input");
    const emailInput = screen.getByTestId("register-email-input");
    const passwordInput = screen.getByTestId("register-password-input");
    const submitBtn = screen.getByTestId("register-submit-button");

    fireEvent.change(nameInput, { target: { value: "Delcom User" } });
    fireEvent.change(emailInput, { target: { value: "user@delcom.org" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(registerSpy).toHaveBeenCalledWith(
      "Delcom User",
      "user@delcom.org",
      "password123"
    );
  });

  it("should reset form fields and navigate to /auth/login on isAuthRegister success", () => {
    renderWithProviders(<RegisterPage />, {
      preloadedState: {
        isAuthRegister: true,
      },
    });

    expect(screen.getByTestId("register-submit-button")).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/auth/login");
  });

  it("should handle error state when isAuthRegister is false while loading", () => {
    const { store } = renderWithProviders(<RegisterPage />, {
      preloadedState: {
        isAuthRegister: null,
      },
    });

    const submitBtn = screen.getByTestId("register-submit-button");
    fireEvent.click(submitBtn);

    // Simulate action failure wrapped in act
    act(() => {
      store.dispatch(authAction.setIsAuthRegisterActionCreator(false));
    });
    expect(screen.getByTestId("register-submit-button")).toBeEnabled();
  });
});
