import { describe, it, expect } from "vitest";
import { clientDummy } from "./index";

describe("clientDummy", () => {
  it("returns client dummy with core", () => {
    expect(clientDummy()).toContain("client dummy");
    expect(clientDummy()).toContain("core dummy");
  });
});
