import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import ChangeModal from "./ChangeModal";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as lostFoundAction from "../states/action";

const silent = () => Promise.resolve({});
const item = { id: 5, title: "Dompet", description: "Warna hitam", status: "found", is_completed: 1 };

function submit() {
  fireEvent.submit(screen.getByTestId("edit-lost-found-modal").querySelector("form"));
}

describe("ChangeModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when hidden or when item is missing", () => {
    const { container, unmount } = renderWithProviders(<ChangeModal show={false} onClose={vi.fn()} lostFound={item} />);
    expect(container.firstChild).toBeNull();
    expect(document.body.style.overflow).toBe("auto");
    unmount();

    const second = renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} lostFound={null} />);
    expect(second.container.firstChild).toBeNull();
  });

  it("should prefill every field from the report", () => {
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} lostFound={item} />);

    expect(screen.getByTestId("edit-lost-found-title-input")).toHaveValue("Dompet");
    expect(screen.getByTestId("edit-lost-found-description-input")).toHaveValue("Warna hitam");
    expect(screen.getByTestId("edit-lost-found-status-select")).toHaveValue("found");
    expect(screen.getByTestId("edit-lost-found-completed-select")).toHaveValue("1");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should fall back to defaults when fields are empty or unknown", () => {
    renderWithProviders(
      <ChangeModal
        show={true}
        onClose={vi.fn()}
        lostFound={{ id: 1, title: null, description: null, status: "lost", is_completed: 0 }}
      />
    );

    expect(screen.getByTestId("edit-lost-found-title-input")).toHaveValue("");
    expect(screen.getByTestId("edit-lost-found-description-input")).toHaveValue("");
    expect(screen.getByTestId("edit-lost-found-status-select")).toHaveValue("lost");
    expect(screen.getByTestId("edit-lost-found-completed-select")).toHaveValue("0");
  });

  it("should validate empty title and description", () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(silent);
    const changeSpy = vi.spyOn(lostFoundAction, "asyncSetIsLostFoundChange");
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} lostFound={item} />);

    fireEvent.change(screen.getByTestId("edit-lost-found-title-input"), { target: { value: "  " } });
    submit();
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    fireEvent.change(screen.getByTestId("edit-lost-found-title-input"), { target: { value: "Judul" } });
    fireEvent.change(screen.getByTestId("edit-lost-found-description-input"), { target: { value: " " } });
    submit();
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it("should dispatch asyncSetIsLostFoundChange with edited values", () => {
    const changeSpy = vi.spyOn(lostFoundAction, "asyncSetIsLostFoundChange").mockReturnValue(() => Promise.resolve());
    renderWithProviders(<ChangeModal show={true} onClose={vi.fn()} lostFound={item} />);

    fireEvent.change(screen.getByTestId("edit-lost-found-title-input"), { target: { value: " Baru " } });
    fireEvent.change(screen.getByTestId("edit-lost-found-description-input"), { target: { value: " Desk baru " } });
    fireEvent.change(screen.getByTestId("edit-lost-found-status-select"), { target: { value: "lost" } });
    fireEvent.change(screen.getByTestId("edit-lost-found-completed-select"), { target: { value: "0" } });
    submit();

    expect(changeSpy).toHaveBeenCalledWith(5, "Baru", "Desk baru", "lost", false);
    expect(screen.getByText("Menyimpan...")).toBeInTheDocument();
  });

  it("should call onSuccess and close when change succeeded", () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    renderWithProviders(<ChangeModal show={true} onClose={onClose} lostFound={item} onSuccess={onSuccess} />, {
      preloadedState: { isLostFoundChange: true, isLostFoundChanged: true },
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalled();
  });

  it("should close even without onSuccess, and stay open on failure", () => {
    const onClose = vi.fn();
    const { unmount } = renderWithProviders(<ChangeModal show={true} onClose={onClose} lostFound={item} />, {
      preloadedState: { isLostFoundChange: true, isLostFoundChanged: true },
    });
    expect(onClose).toHaveBeenCalledTimes(1);
    unmount();

    const stay = vi.fn();
    renderWithProviders(<ChangeModal show={true} onClose={stay} lostFound={item} onSuccess={vi.fn()} />, {
      preloadedState: { isLostFoundChange: true, isLostFoundChanged: false },
    });
    expect(stay).not.toHaveBeenCalled();
  });

  it("should close on close/cancel buttons and not propagate panel clicks", () => {
    const onClose = vi.fn();
    const outer = vi.fn();
    renderWithProviders(
      <div onClick={outer}>
        <ChangeModal show={true} onClose={onClose} lostFound={item} />
      </div>
    );

    fireEvent.click(screen.getByTestId("close-edit-modal-btn"));
    fireEvent.click(screen.getByTestId("cancel-edit-modal-btn"));
    expect(onClose).toHaveBeenCalledTimes(2);

    outer.mockClear();
    fireEvent.click(screen.getByTestId("edit-lost-found-modal").firstElementChild);
    expect(outer).not.toHaveBeenCalled();
  });
});
