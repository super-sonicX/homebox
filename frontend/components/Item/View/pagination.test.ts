import { describe, expect, test } from "vitest";
import { clampPageToTotal, isCurrentLocationPage, locationItemDataKey, normalizeLocationPageSize } from "./pagination";

describe("clampPageToTotal", () => {
  test.each([
    [2, 48, 24, 2],
    [2, 24, 24, 1],
    [4, 50, 24, 3],
    [2, 0, 24, 1],
    [1, 1, 24, 1],
    [0, 100, 24, 1],
    [3, 1, 0, 1],
    [3, 0, 0, 1],
  ])("clamps page %i with total %i and size %i to %i", (page, total, size, expected) => {
    expect(clampPageToTotal(page, total, size)).toBe(expected);
  });
});

describe("isCurrentLocationPage", () => {
  test("shows only the successful current page", () => {
    expect(isCurrentLocationPage("success", "page-2", "page-2")).toBe(true);
  });

  test("hides previous-page rows even if cached status says success", () => {
    expect(isCurrentLocationPage("success", "page-2", "page-1")).toBe(false);
  });

  test("hides rows and counts while loading or refreshing", () => {
    expect(isCurrentLocationPage("pending", "page-2", "page-2")).toBe(false);
    expect(isCurrentLocationPage("idle", "page-2", "page-2")).toBe(false);
  });

  test("hides rows after errors or without a keyed result", () => {
    expect(isCurrentLocationPage("error", "page-2", "page-2")).toBe(false);
    expect(isCurrentLocationPage("success", "page-2")).toBe(false);
  });
});

describe("normalizeLocationPageSize", () => {
  test.each([
    [12, 12],
    [24, 24],
    [48, 48],
    [96, 96],
    [1, 1],
    [150, 96],
    [20.5, 20],
    ["48", 48],
    ["24.9", 24],
    ["abc", 24],
    ["", 24],
    [0, 24],
    [-5, 24],
    [null, 24],
    [undefined, 24],
    [NaN, 24],
    [Infinity, 24],
    [true, 24],
    [{}, 24],
  ])("normalizes saved preference %s to valid page size %i", (input, expected) => {
    expect(normalizeLocationPageSize(input)).toBe(expected);
  });
});

describe("locationItemDataKey", () => {
  test("direct-mode key ignores page and page-size changes", () => {
    const key = locationItemDataKey("attic", "direct", 1, 12);
    expect(locationItemDataKey("attic", "direct", 3, 48)).toBe(key);
    expect(locationItemDataKey("attic", "direct", 1, 96)).toBe(key);
  });

  test("direct-mode key changes for another location or depth", () => {
    const key = locationItemDataKey("attic", "direct", 1, 12);
    expect(locationItemDataKey("shed", "direct", 1, 12)).not.toBe(key);
    expect(locationItemDataKey("attic", "1", 1, 12)).not.toBe(key);
  });

  test("descendant-mode key changes for page and page size", () => {
    const key = locationItemDataKey("attic", "all", 1, 12);
    expect(locationItemDataKey("attic", "all", 2, 12)).not.toBe(key);
    expect(locationItemDataKey("attic", "all", 1, 24)).not.toBe(key);
  });
});
