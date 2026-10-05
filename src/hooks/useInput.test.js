import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useInput from "./useInput";

describe("useInput", () => {
  it("should initialize with default value and change value on change handler", () => {
    const { result } = renderHook(() => useInput("initial"));

    expect(result.current[0]).toBe("initial");

    act(() => {
      result.current[1]({ target: { value: "updated" } });
    });

    expect(result.current[0]).toBe("updated");

    act(() => {
      result.current[2]("direct");
    });

    expect(result.current[0]).toBe("direct");
  });

  it("should initialize with empty string when no default given", () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe("");
  });
});
