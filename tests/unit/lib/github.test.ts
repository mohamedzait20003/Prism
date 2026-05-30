import { describe, it, expect } from "vitest";
import { parseRepo } from "@/lib/github";

describe("parseRepo", () => {
  it("splits a full repo name into owner and repo", () => {
    expect(parseRepo("facebook/react")).toEqual({ owner: "facebook", repo: "react" });
  });

  it("handles org names with hyphens", () => {
    expect(parseRepo("my-org/my-repo")).toEqual({ owner: "my-org", repo: "my-repo" });
  });

  it("handles single-segment repo names", () => {
    const result = parseRepo("owner/repo-name");
    expect(result.owner).toBe("owner");
    expect(result.repo).toBe("repo-name");
  });
});
