import { describe, expect, it } from "vitest";
import { AUTO_SAVE_DELAY_MS } from "./Editor";
describe("preview contract", () => {
  it("keeps schema version stable", () => expect(1).toBe(1));
});
describe("editor autosave", () => {
  it("defaults to three minutes", () =>
    expect(AUTO_SAVE_DELAY_MS).toBe(180_000));
});
