export interface Stats {
  totalReviews: number;
  totalComments: number;
  approvalRate: number | null;
  feedbackCount: number;
  topRules: { ruleId: string | null; count: number }[];
}
