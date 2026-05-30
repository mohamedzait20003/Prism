import { createHmac } from "crypto";
import { describe, it, expect } from "vitest";
import { verifyHmacSignature } from "@/lib/crypto";

const SECRET = "test-secret";

function sign(body: string): string {
  return "sha256=" + createHmac("sha256", SECRET).update(body).digest("hex");
}

describe("verifyHmacSignature", () => {
  it("returns true for a valid signature", () => {
    const body = JSON.stringify({ action: "opened" });
    expect(verifyHmacSignature(body, sign(body), SECRET)).toBe(true);
  });

  it("returns false for a tampered body", () => {
    const body = JSON.stringify({ action: "opened" });
    const tampered = JSON.stringify({ action: "closed" });
    expect(verifyHmacSignature(tampered, sign(body), SECRET)).toBe(false);
  });

  it("returns false for a null signature", () => {
    expect(verifyHmacSignature("body", null, SECRET)).toBe(false);
  });

  it("returns false for a malformed signature", () => {
    expect(verifyHmacSignature("body", "not-a-real-sig", SECRET)).toBe(false);
  });

  it("returns false for wrong secret", () => {
    const body = "payload";
    const sig = sign(body);
    expect(verifyHmacSignature(body, sig, "wrong-secret")).toBe(false);
  });
});
