import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import AddModal from "./AddModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const silent = () => Promise.resolve({});

function submit() {
  fireEvent.submit(screen.getByTestId("add-lost-found-modal").querySelector("form"));
}

describe("AddModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false", () => {
    const { container } = renderWithProviders(<AddModal show={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("should render the form and lock body scroll when shown", () => {
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);
    expect(screen.getByTestId("add-lost-found-modal")).toBeInTheDocument();
    expect(screen.getByTestId("add-lost-found-status-select")).toHaveValue("lost");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should validate empty title and empty description", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(silent);
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);

    submit();
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    fireEvent.change(screen.getByTestId("add-lost-found-title-input"), { target: { value: "Dompet" } });
    submit();
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch asyncSetIsLostFoundAdd with trimmed values and chosen status", () => {
    const addSpy = vi.spyOn(lostFoundAction, "asyncSetIsLostFoundAdd").mockReturnValue(() => Promise.resolve());
    renderWithProviders(<AddModal show={true} onClose={vi.fn()} />);

    fireEvent.change(screen.getByTestId("add-lost-found-status-select"), { target: { value: "found" } });
    fireEvent.change(screen.getByTestId("add-lost-found-title-input"), { target: { value: "  Kunci  " } });
    fireEvent.change(screen.getByTestId("add-lost-found-description-input"), { target: { value: "  Ada gantungan  " } });
    submit();

    expect(addSpy).toHaveBeenCalledWith("Kunci", "Ada gantungan", "found");
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
    expect(screen.getByTestId("submit-add-modal-btn")).toBeDisabled();
  });

  it("should call onSuccess, reset and close when add succeeded", () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    renderWithProviders(<AddModal show={true} onClose={onClose} onSuccess={onSuccess} />, {
      preloadedState: { isLostFoundAdd: true, isLostFoundAdded: true },
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("should close even when onSuccess is not provided", () => {
    const onClose = vi.fn();
    renderWithProviders(<AddModal show={true} onClose={onClose} />, {
      preloadedState: { isLostFoundAdd: true, isLostFoundAdded: true },
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("should stay open when add finished but failed", () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    renderWithProviders(<AddModal show={true} onClose={onClose} onSuccess={onSuccess} />, {
      preloadedState: { isLostFoundAdd: true, isLostFoundAdded: false },
    });
    expect(onClose).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should close on close/cancel buttons and not propagate panel clicks", () => {
    const onClose = vi.fn();
    const outer = vi.fn();
    renderWithProviders(
      <div onClick={outer}>
        <AddModal show={true} onClose={onClose} />
      </div>
    );

    fireEvent.click(screen.getByTestId("close-add-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-add-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);

    outer.mockClear();
    fireEvent.click(screen.getByTestId("add-lost-found-modal").firstElementChild);
    expect(outer).not.toHaveBeenCalled();
  });
});
