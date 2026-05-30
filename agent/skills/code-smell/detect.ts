export interface DiffLine {
  file: string;
  lineNumber: number;
  content: string;
}

export function extractAddedLines(diff: string): DiffLine[] {
  const lines = diff.split("\n");
  const result: DiffLine[] = [];
  let currentFile = "";
  let currentLine = 0;

  for (const line of lines) {
    if (line.startsWith("+++ b/")) {
      currentFile = line.slice(6);
      currentLine = 0;
      continue;
    }
    if (line.startsWith("+++ ")) {
      currentFile = line.slice(4);
      currentLine = 0;
      continue;
    }
    // Parse hunk header: @@ -a,b +c,d @@
    const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunkMatch) {
      currentLine = parseInt(hunkMatch[1], 10) - 1;
      continue;
    }
    if (line.startsWith("---")) continue;
    if (line.startsWith("diff ") || line.startsWith("index ")) continue;

    if (line.startsWith("+")) {
      currentLine++;
      result.push({
        file: currentFile,
        lineNumber: currentLine,
        content: line.slice(1),
      });
    } else if (!line.startsWith("-")) {
      // Context line
      currentLine++;
    }
  }

  return result;
}
