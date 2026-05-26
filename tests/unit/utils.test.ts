// Unit tests for utility functions

import { cn } from "@/lib/utils";
import { describe, expect, it } from "vitest";

describe("cn (class name utility)", () => {
  it("merges class names correctly", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const result = cn("foo", false && "bar", "baz");
    expect(result).toBe("foo baz");
  });

  it("handles undefined and null", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toBe("foo bar");
  });

  it("merges tailwind classes with conflicting styles", () => {
    const result = cn("px-2", "px-4");
    // Should keep only the last one (twMerge behavior)
    expect(result).toContain("px-4");
  });

  it("handles empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles array input", () => {
    const result = cn(["foo", "bar"]);
    expect(result).toBe("foo bar");
  });
});
