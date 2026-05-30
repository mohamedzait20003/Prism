export interface Finding {
  file: string;
  line: number;
  message: string;
  severity: "error" | "warning" | "info";
  ruleId: string;
}

export interface AgentData {
  soul: string;
  rules: string;
  commits: { hash: string; message: string; date: string }[];
}
