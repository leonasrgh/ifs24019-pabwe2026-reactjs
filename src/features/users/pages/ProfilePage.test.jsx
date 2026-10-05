import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ProfilePage from "./ProfilePage";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as userAction from "../states/action";

describe("ProfilePage", () => {
  const mockProfile = {
    id: 1,
    name: "Abdullah Ubaid",
    email: "ifs18005@del.ac.id",
    photo: "https://example.com/photo.jpg",
  };

  const mockProfileEmptyName = {
    id: 3,
    name: "",
    email: "",
    photo: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading indicator when profile is null", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: { profile: null },
    });
    expect(screen.getByText("Memuat data profil...")).toBeInTheDocument();
  });

  it("should display profile information and initial avatar fallback", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        profile: {
          id: 2,
          name: "Budi",
          email: "budi@del.ac.id",
          photo: null,
        },
      },
    });

    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("budi@del.ac.id")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("should handle profile with empty name and email using fallback avatar initial", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        profile: mockProfileEmptyName,
      },
    });

    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should validate and submit update profile", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const putProfileSpy = vi
      .spyOn(userAction, "asyncPutProfile")
      .mockReturnValue(() => {});

    renderWithProviders(<ProfilePage />, {
      preloadedState: { profile: mockProfile },
    });

    const nameInput = screen.getByTestId("profile-name-input");
    const emailInput = screen.getByTestId("profile-email-input");
    const profileForm = nameInput.closest("form");

    // Empty name
    fireEvent.change(nameInput, { target: { value: "   " } });
    fireEvent.submit(profileForm);
    expect(errorSpy).toHaveBeenCalledWith("Nama tidak boleh kosong!");

    // Empty email
    fireEvent.change(nameInput, { target: { value: "Abdullah Baru" } });
    fireEvent.change(emailInput, { target: { value: "   " } });
    fireEvent.submit(profileForm);
    expect(errorSpy).toHaveBeenCalledWith("Email tidak boleh kosong!");

    // Valid
    fireEvent.change(emailInput, { target: { value: "baru@del.ac.id" } });
    fireEvent.submit(profileForm);
    expect(putProfileSpy).toHaveBeenCalledWith("Abdullah Baru", "baru@del.ac.id");
  });

  it("should validate and upload photo", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const photoSpy = vi
      .spyOn(userAction, "asyncPostProfilePhoto")
      .mockReturnValue(() => {});

    renderWithProviders(<ProfilePage />, {
      preloadedState: { profile: mockProfile },
    });

    const fileInput = screen.getByTestId("profile-photo-file-input");

    // Empty file
    fireEvent.change(fileInput, { target: { files: [] } });

    // Invalid file type
    const textFile = new File(["dummy"], "file.txt", { type: "text/plain" });
    fireEvent.change(fileInput, { target: { files: [textFile] } });
    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar yang valid!");

    // Large file (>3MB)
    const largeFile = new File([new Uint8Array(4 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    expect(errorSpy).toHaveBeenCalledWith("Ukuran file foto maksimal 3MB!");

    // Valid file
    const validFile = new File(["img"], "profile.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    expect(photoSpy).toHaveBeenCalledWith(validFile);
  });

  it("should validate and submit password update", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const putPasswordSpy = vi
      .spyOn(userAction, "asyncPutProfilePassword")
      .mockReturnValue(() => {});

    renderWithProviders(<ProfilePage />, {
      preloadedState: { profile: mockProfile },
    });

    const oldPassInput = screen.getByTestId("current-password-input");
    const newPassInput = screen.getByTestId("new-password-input");
    const confirmPassInput = screen.getByTestId("confirm-password-input");
    const passwordForm = oldPassInput.closest("form");

    // Empty old password
    fireEvent.submit(passwordForm);
    expect(errorSpy).toHaveBeenCalledWith("Kata sandi lama wajib diisi!");

    // Short new password (<6)
    fireEvent.change(oldPassInput, { target: { value: "old123" } });
    fireEvent.change(newPassInput, { target: { value: "123" } });
    fireEvent.submit(passwordForm);
    expect(errorSpy).toHaveBeenCalledWith("Kata sandi baru minimal 6 karakter!");

    // Confirmation mismatch
    fireEvent.change(newPassInput, { target: { value: "password123" } });
    fireEvent.change(confirmPassInput, { target: { value: "mismatch123" } });
    fireEvent.submit(passwordForm);
    expect(errorSpy).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok!");

    // Valid
    fireEvent.change(confirmPassInput, { target: { value: "password123" } });
    fireEvent.submit(passwordForm);
    expect(putPasswordSpy).toHaveBeenCalledWith(
      "old123",
      "password123",
      "password123"
    );
  });

  it("should handle status flags from store", () => {
    renderWithProviders(<ProfilePage />, {
      preloadedState: {
        profile: mockProfile,
        isChangeProfile: true,
        isChangeProfilePhoto: true,
        isChangeProfilePassword: true,
      },
    });

    expect(screen.getByText("Profil Akun")).toBeInTheDocument();
  });
});
