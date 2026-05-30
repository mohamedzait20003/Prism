export interface Comment {
  id: string;
  file: string;
  line: number;
  message: string;
  severity: string;
  ruleId: string | null;
  approved: boolean | null;
  humanEdit: string | null;
}

export interface ReviewSummary {
  id: string;
  repo: string;
  prNum: number;
  commentCount: number;
  createdAt: string;
}

export interface ReviewDetail {
  id: string;
  repo: string;
  prNum: number;
  sha: string;
  agentVer: string;
  createdAt: string;
  comments: Comment[];
}
