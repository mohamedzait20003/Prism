import { describe, it, expect } from "vitest";
import { extractAddedLines } from "../../../agent/skills/code-smell/detect";

const simpleDiff = `diff --git a/src/index.ts b/src/index.ts
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,3 +1,5 @@
 const a = 1;
+const b = eval(userInput);
 const c = 3;
+console.log("debug");
`;

describe("extractAddedLines", () => {
  it("extracts only added lines from a unified diff", () => {
    const lines = extractAddedLines(simpleDiff);
    expect(lines).toHaveLength(2);
    expect(lines[0].content).toBe('const b = eval(userInput);');
    expect(lines[1].content).toBe('console.log("debug");');
  });

  it("computes correct line numbers from hunk headers", () => {
    const lines = extractAddedLines(simpleDiff);
    expect(lines[0].lineNumber).toBe(2);
    expect(lines[1].lineNumber).toBe(4);
  });

  it("assigns the correct file path", () => {
    const lines = extractAddedLines(simpleDiff);
    expect(lines[0].file).toBe("src/index.ts");
    expect(lines[1].file).toBe("src/index.ts");
  });

  it("returns empty array when there are no additions", () => {
    const removalsOnly = `diff --git a/foo.ts b/foo.ts
--- a/foo.ts
+++ b/foo.ts
@@ -1,2 +1,1 @@
 const a = 1;
-const b = 2;
`;
    expect(extractAddedLines(removalsOnly)).toHaveLength(0);
  });

  it("handles diffs across multiple files", () => {
    const multiFile = `diff --git a/a.ts b/a.ts
--- a/a.ts
+++ b/a.ts
@@ -1,1 +1,2 @@
 line
+addedA
diff --git a/b.ts b/b.ts
--- a/b.ts
+++ b/b.ts
@@ -1,1 +1,2 @@
 line
+addedB
`;
    const lines = extractAddedLines(multiFile);
    expect(lines).toHaveLength(2);
    expect(lines[0].file).toBe("a.ts");
    expect(lines[1].file).toBe("b.ts");
  });
});
