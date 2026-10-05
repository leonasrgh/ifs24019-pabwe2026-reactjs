import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeCoverModal from "./ChangeCoverModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

describe("ChangeCoverModal", () => {
  const mockLostFound = { id: 1, title: "LostFound Test" };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn().mockReturnValue("blob:mock-url");
  });

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(
      <ChangeCoverModal show={false} onClose={vi.fn()} lostFound={mockLostFound} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("should validate file presence, file type, and file size", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    renderWithProviders(<ChangeCoverModal show={true} onClose={vi.fn()} lostFound={mockLostFound} />);

    const fileInput = screen.getByTestId("cover-file-input");
    const form = fileInput.closest("form");

    fireEvent.submit(form);
    expect(errorSpy).toHaveBeenCalledWith("Pilih file cover terlebih dahulu!");

    // Empty files test
    fireEvent.change(fileInput, { target: { files: [] } });

    // Non-image file test
    const badFile = new File(["dummy"], "doc.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [badFile] } });
    expect(errorSpy).toHaveBeenCalledWith("Hanya file JPEG, JPG, atau PNG yang diperbolehkan!");

    // Large file test (>1MB)
    const largeFile = new File([new Uint8Array(2 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    expect(errorSpy).toHaveBeenCalledWith("Ukuran file terlalu besar. Maksimal 1MB!");
  });

  it("should preview selected image and dispatch cover upload on valid file", () => {
    const changeCoverSpy = vi
      .spyOn(lostFoundAction, "asyncSetIsLostFoundChangeCover")
      .mockReturnValue(() => {});
    const onClose = vi.fn();

    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} lostFound={mockLostFound} />,
      {
        preloadedState: {
          isLostFoundChangeCover: false,
          isLostFoundChangedCover: false,
        },
      }
    );

    const fileInput = screen.getByTestId("cover-file-input");
    const validFile = new File(["dummy"], "photo.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByAltText("Preview")).toBeInTheDocument();

    const form = fileInput.closest("form");
    fireEvent.submit(form);

    expect(changeCoverSpy).toHaveBeenCalledWith(1, validFile);

    // Simulate completion
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} lostFound={mockLostFound} />,
      {
        preloadedState: {
          isLostFoundChangeCover: true,
          isLostFoundChangedCover: true,
        },
      }
    );

    expect(onClose).toHaveBeenCalled();
  });

  it("should handle isLostFoundChangeCover true when isLostFoundChangedCover is false", () => {
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={vi.fn()} lostFound={mockLostFound} />,
      {
        preloadedState: {
          isLostFoundChangeCover: true,
          isLostFoundChangedCover: false,
        },
      }
    );

    expect(screen.getByTestId("change-cover-modal")).toBeInTheDocument();
  });

  it("should trigger onClose when close or cancel button clicked", () => {
    const onClose = vi.fn();
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} lostFound={mockLostFound} />
    );

    fireEvent.click(screen.getByTestId("close-cover-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId("cancel-cover-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("ChangeCoverModal onSuccess", () => {
  it("should call onSuccess and close after a successful cover upload", () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} lostFound={{ id: 1 }} onSuccess={onSuccess} />,
      { preloadedState: { isLostFoundChangeCover: true, isLostFoundChangedCover: true } }
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("should close without onSuccess callback", () => {
    const onClose = vi.fn();
    renderWithProviders(
      <ChangeCoverModal show={true} onClose={onClose} lostFound={{ id: 1 }} />,
      { preloadedState: { isLostFoundChangeCover: true, isLostFoundChangedCover: true } }
    );
    expect(onClose).toHaveBeenCalled();
  });
});
