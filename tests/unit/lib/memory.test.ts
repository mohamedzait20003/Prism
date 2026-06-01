import { describe, it, expect, beforeEach } from "vitest";

describe("encrypt / decrypt round-trip", () => {
  beforeEach(() => {
    // 32 random bytes base64 — deterministic for tests
    process.env.TOKEN_ENCRYPTION_KEY = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
  });

  it("encrypts and decrypts a GitHub token", async () => {
    const { encrypt, decrypt } = await import("@/lib/encrypt");
    const original = "ghp_test_token_1234567890";
    const ciphertext = encrypt(original);
    expect(ciphertext).not.toBe(original);
    expect(decrypt(ciphertext)).toBe(original);
  });

  it("produces different ciphertext for the same input (random IV)", async () => {
    const { encrypt } = await import("@/lib/encrypt");
    const a = encrypt("same-value");
    const b = encrypt("same-value");
    expect(a).not.toBe(b);
  });

  it("throws on tampered ciphertext", async () => {
    const { encrypt, decrypt } = await import("@/lib/encrypt");
    const ciphertext = encrypt("sensitive");
    const tampered = ciphertext.slice(0, -4) + "XXXX";
    expect(() => decrypt(tampered)).toThrow();
  });
});
