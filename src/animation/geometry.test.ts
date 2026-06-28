import { describe, expect, test } from "bun:test";
import { getStackTransform } from "./geometry";

describe("getStackTransform", () => {
  test("uses measured heights and gap when expanded", () => {
    expect(
      getStackTransform({ index: 2, gap: 14, expanded: true, position: "top", heightBefore: 120, peek: 14 }),
    ).toEqual({
      y: 120 + 14 * 2,
      scale: 1,
      opacity: 1,
      zIndex: 998,
    });
  });

  test("collapses behind the front with peek offset and shrinking scale", () => {
    expect(
      getStackTransform({ index: 1, gap: 14, expanded: false, position: "bottom", heightBefore: 0, peek: 14 }),
    ).toMatchObject({
      opacity: 1,
      scale: 0.94,
      y: -14,
      zIndex: 999,
    });
  });

  test("clamps the collapsed scale floor for deep stacks", () => {
    expect(
      getStackTransform({ index: 9, gap: 14, expanded: false, position: "top", heightBefore: 0, peek: 14 }).scale,
    ).toBe(0.82);
  });
});
