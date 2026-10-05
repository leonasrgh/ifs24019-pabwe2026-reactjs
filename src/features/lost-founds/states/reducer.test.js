import { describe, it, expect } from "vitest";
import {
  lostFoundsReducer,
  lostFoundReducer,
  isLostFoundReducer,
  lostFoundStatsReducer,
  isLostFoundAddReducer,
  isLostFoundAddedReducer,
  isLostFoundChangeReducer,
  isLostFoundChangedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundDeleteReducer,
  isLostFoundDeletedReducer,
} from "./reducer";
import { ActionType } from "./action";

describe("lost-founds reducers", () => {
  it.each([
    ["lostFoundsReducer", lostFoundsReducer, [], ActionType.SET_LOST_FOUNDS, [{ id: 1 }]],
    ["lostFoundReducer", lostFoundReducer, null, ActionType.SET_LOST_FOUND, { id: 1 }],
    ["isLostFoundReducer", isLostFoundReducer, false, ActionType.SET_IS_LOST_FOUND, true],
    ["lostFoundStatsReducer", lostFoundStatsReducer, null, ActionType.SET_LOST_FOUND_STATS, { a: 1 }],
    ["isLostFoundAddReducer", isLostFoundAddReducer, false, ActionType.SET_IS_LOST_FOUND_ADD, true],
    ["isLostFoundAddedReducer", isLostFoundAddedReducer, false, ActionType.SET_IS_LOST_FOUND_ADDED, true],
    ["isLostFoundChangeReducer", isLostFoundChangeReducer, false, ActionType.SET_IS_LOST_FOUND_CHANGE, true],
    ["isLostFoundChangedReducer", isLostFoundChangedReducer, false, ActionType.SET_IS_LOST_FOUND_CHANGED, true],
    ["isLostFoundChangeCoverReducer", isLostFoundChangeCoverReducer, false, ActionType.SET_IS_LOST_FOUND_CHANGE_COVER, true],
    ["isLostFoundChangedCoverReducer", isLostFoundChangedCoverReducer, false, ActionType.SET_IS_LOST_FOUND_CHANGED_COVER, true],
    ["isLostFoundDeleteReducer", isLostFoundDeleteReducer, false, ActionType.SET_IS_LOST_FOUND_DELETE, true],
    ["isLostFoundDeletedReducer", isLostFoundDeletedReducer, false, ActionType.SET_IS_LOST_FOUND_DELETED, true],
  ])("%s should return default state, handle its action and ignore others", (_name, reducer, initial, type, payload) => {
    expect(reducer(undefined)).toEqual(initial);
    expect(reducer(undefined, { type: "UNKNOWN" })).toEqual(initial);
    expect(reducer(initial, { type, payload })).toEqual(payload);
  });
});
