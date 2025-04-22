import { describe, it, expect } from "vitest";
import { xmcDummy } from "./index";

describe("xmcDummy", () => {
  it("returns xmc dummy with client", () => {
    expect(xmcDummy()).toContain("xmc dummy +client dummy ++core dummy +");
  });
});
