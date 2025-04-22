import { describe, it, expect } from "vitest";
import { coreDummy } from "./index";

describe("coreDummy", () => {
  it("returns core dummy", () => {
    expect(coreDummy()).toBe("core dummy +");
  });
});
