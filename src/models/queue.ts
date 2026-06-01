export interface ReviewJobPayload {
  repoFullName: string;
  repoId?: string;
  prNum: number;
  sha: string;
  diffUrl: string;
  agentRepo: string;
  githubToken?: string;
}
