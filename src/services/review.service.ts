import { db } from "@/lib/db";

export class ReviewService {
  private where(profileId?: string | null, isAdmin = false) {
    if (isAdmin || !profileId) return {};
    return { repoId: { in: (async () => {
      const repos = await db.connectedRepo.findMany({
        where: { profileId },
        select: { id: true },
      });
      
      return repos.map((r) => r.id);
    })() } };
  }

  async getStats(profileId?: string | null, isAdmin = false) {
    const repoFilter = isAdmin || !profileId ? {} : { repoId: { in: await db.connectedRepo.findMany({ where: { profileId }, select: { id: true } }).then((r) => r.map((x) => x.id)) } };

    const feedbackFilter = isAdmin || !profileId ? {} : { userId: profileId };

    const [totalReviews, totalComments, approvedComments, feedbackedComments, topRules, feedbackCount] =
      await Promise.all([
        db.review.count({ where: repoFilter }),
        db.comment.count({ where: { review: repoFilter } }),
        db.comment.count({ where: { review: repoFilter, approved: true } }),
        db.comment.count({ where: { review: repoFilter, approved: { not: null } } }),
        db.feedbackEntry.groupBy({
          by: ["ruleId"],
          where: repoFilter,
          _count: { ruleId: true },
          orderBy: { _count: { ruleId: "desc" } },
          take: 5,
        }),
        db.feedbackEntry.count({ where: repoFilter }),
      ]);

    return {
      totalReviews,
      totalComments,
      approvalRate: feedbackedComments > 0 ? Math.round((approvedComments / feedbackedComments) * 100) : null,
      feedbackCount,
      topRules: topRules.map((r) => ({ ruleId: r.ruleId, count: r._count.ruleId })),
    };
  }

  async getRecent(profileId?: string | null, isAdmin = false, take = 10) {
    const repoFilter = isAdmin || !profileId
      ? {}
      : { repoId: { in: await db.connectedRepo.findMany({ where: { profileId }, select: { id: true } }).then((r) => r.map((x) => x.id)) } };

    return db.review.findMany({
      where: repoFilter,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        _count: { select: { comments: true } },
        repo: { select: { fullName: true } },
      },
    });
  }

  async getById(id: string) {
    return db.review.findUnique({
      where: { id },
      include: { comments: { orderBy: { createdAt: "asc" } }, repo: { select: { fullName: true } } },
    });
  }

  async getAllUsers() {
    return db.user.findMany({
      where: { role: "CLIENT" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        createdAt: true,
        clientProfile: {
          select: {
            githubLogin: true,
            _count: { select: { feedback: true } },
            repos: {
              select: { id: true, fullName: true, active: true, createdAt: true },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
  }
}

export const reviewService = new ReviewService();
