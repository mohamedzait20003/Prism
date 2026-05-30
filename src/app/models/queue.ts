export interface ReviewJobPayload {
  repo: string;
  prNum: number;
  sha: string;
  diffUrl: string;
  agentRepo: string;
}

export interface FeedbackEntry {
  prNum: number;
  repo: string;
  file: string;
  line: number;
  ruleId: string;
  agentComment: string;
  humanEdit: string | null;
}
