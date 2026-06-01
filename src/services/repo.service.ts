import { createHash, randomBytes, randomUUID } from "crypto";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encrypt";
import { registerWebhook, deleteWebhook, listUserRepos, parseRepo } from "@/lib/github";

export class RepoService {
  async listConnected(profileId: string) {
    return db.connectedRepo.findMany({
      where: { profileId },
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, active: true, createdAt: true },
    });
  }

  async listAllConnected() {
    return db.connectedRepo.findMany({
      orderBy: { createdAt: "desc" },
      include: { profile: { include: { user: { select: { email: true, name: true } } } } },
    });
  }

  async listGithubRepos(encryptedToken: string) {
    const token = decrypt(encryptedToken);
    return listUserRepos(token);
  }

  async connect(profileId: string, encryptedToken: string, fullName: string, appUrl: string) {
    const token = decrypt(encryptedToken);
    const { owner, repo } = parseRepo(fullName);

    const webhookUrlId = randomUUID();
    const webhookSecret = randomBytes(32).toString("hex");
    const webhookIdHash = createHash("sha256").update(webhookUrlId).digest("hex");
    const webhookUrl = `${appUrl}/api/webhook/${webhookUrlId}`;

    const githubWebhookId = await registerWebhook(owner, repo, token, webhookUrl, webhookSecret);

    return db.connectedRepo.create({
      data: {
        profileId,
        fullName,
        githubWebhookId,
        webhookIdHash,
        webhookSecret: encrypt(webhookSecret),
      },
    });
  }

  async disconnect(repoId: string, requesterId: string, isAdmin: boolean) {
    const repo = await db.connectedRepo.findUnique({
      where: { id: repoId },
      include: { profile: true },
    });
    if (!repo) throw new Error("Repository not found");

    const isOwner = repo.profile.userId === requesterId;
    if (!isOwner && !isAdmin) throw new Error("Forbidden");

    if (repo.githubWebhookId) {
      try {
        const token = decrypt(repo.profile.githubToken);
        const { owner, repo: repoName } = parseRepo(repo.fullName);
        await deleteWebhook(owner, repoName, repo.githubWebhookId, token);
      } catch {
        // webhook may already be deleted on GitHub
      }
    }

    return db.connectedRepo.delete({ where: { id: repoId } });
  }

  async findByWebhookHash(webhookIdHash: string) {
    return db.connectedRepo.findUnique({
      where: { webhookIdHash },
      include: { profile: true },
    });
  }
}

export const repoService = new RepoService();
