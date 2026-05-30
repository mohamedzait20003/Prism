import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  appendFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("simple-git", () => ({
  default: vi.fn(() => ({
    add: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
}));

import { writeFeedback } from "@/lib/memory";
import { appendFile } from "fs/promises";

describe("writeFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AGENT_REPO_PATH = "/tmp/agent";
  });

  it("appends a markdown block to feedback.md", async () => {
    await writeFeedback({
      prNum: 42,
      repo: "org/repo",
      file: "src/auth.ts",
      line: 10,
      ruleId: "eval-injection",
      agentComment: "eval() called with user input",
      humanEdit: "This is intentional",
    });

    expect(appendFile).toHaveBeenCalledOnce();
    const [, content] = (appendFile as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(content).toContain("## PR #42");
    expect(content).toContain("org/repo");
    expect(content).toContain("eval-injection");
    expect(content).toContain("This is intentional");
  });

  it("writes 'Dismissed' when humanEdit is null", async () => {
    await writeFeedback({
      prNum: 1,
      repo: "a/b",
      file: "x.ts",
      line: 1,
      ruleId: "console-log",
      agentComment: "console.log in production",
      humanEdit: null,
    });

    const [, content] = (appendFile as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(content).toContain("Dismissed");
  });

  it("commits the change to git", async () => {
    const simpleGit = await import("simple-git");
    const mockGit = {
      add: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
    };
    (simpleGit.default as ReturnType<typeof vi.fn>).mockReturnValue(mockGit);

    await writeFeedback({
      prNum: 5,
      repo: "org/repo",
      file: "api.ts",
      line: 3,
      ruleId: "sql-injection",
      agentComment: "Raw SQL concat",
      humanEdit: null,
    });

    expect(mockGit.commit).toHaveBeenCalledWith(
      expect.stringContaining("PR #5")
    );
  });
});
