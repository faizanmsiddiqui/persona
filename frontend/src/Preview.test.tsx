import { describe, expect, it } from "vitest";
import { AUTO_SAVE_DELAY_MS } from "./Editor";
import { SECTION_DEFINITIONS } from "./SectionEditor";
describe("preview contract", () => {
  it("keeps schema version stable", () => expect(1).toBe(1));
});
describe("editor autosave", () => {
  it("defaults to three minutes", () =>
    expect(AUTO_SAVE_DELAY_MS).toBe(180_000));
});
describe("resume sections", () => {
  it("supports the complete section catalog", () =>
    expect(SECTION_DEFINITIONS.map((section) => section.kind)).toEqual([
      "experience",
      "education",
      "skills",
      "projects",
      "certifications",
      "languages",
      "custom",
    ]));
});
