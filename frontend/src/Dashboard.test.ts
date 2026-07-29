import { describe, expect, it } from "vitest";
import { withoutResume } from "./Dashboard";
import type { Resume } from "./types";

describe("resume deletion", () => {
  it("removes only the deleted résumé from cached results", () => {
    const resumes = [
      { id: "first", title: "First" },
      { id: "second", title: "Second" },
    ] as Resume[];

    expect(withoutResume(resumes, "first")).toEqual([resumes[1]]);
  });
});
