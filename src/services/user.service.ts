import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

export class UserService {
  async findById(id: string) {
    return db.user.findUnique({ where: { id }, include: { clientProfile: true } });
  }

  async findByEmail(email: string) {
    return db.user.findUnique({ where: { email }, include: { clientProfile: true } });
  }

  async upsertFromGitHub(data: {
    email: string;
    name?: string | null;
    image?: string | null;
    githubId: string;
    githubLogin: string;
    githubToken: string; // already encrypted
  }) {
    const user = await db.user.upsert({
      where: { email: data.email },
      create: {
        email: data.email,
        name: data.name,
        image: data.image,
        role: "CLIENT",
        clientProfile: {
          create: {
            githubId: data.githubId,
            githubLogin: data.githubLogin,
            githubToken: data.githubToken,
          },
        },
      },
      update: {
        name: data.name,
        image: data.image,
        clientProfile: {
          upsert: {
            create: {
              githubId: data.githubId,
              githubLogin: data.githubLogin,
              githubToken: data.githubToken,
            },
            update: {
              githubLogin: data.githubLogin,
              githubToken: data.githubToken,
            },
          },
        },
      },
      include: { clientProfile: true },
    });
    return user;
  }

  async createWithPassword(data: {
    email: string;
    username: string;
    password: string;
    name?: string;
    role?: Role;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 12);
    return db.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        name: data.name,
        role: data.role ?? "CLIENT",
      },
    });
  }

  async verifyPassword(user: { passwordHash: string | null }, password: string): Promise<boolean> {
    if (!user.passwordHash) return false;
    return bcrypt.compare(password, user.passwordHash);
  }

  async promoteToAdmin(id: string) {
    return db.user.update({ where: { id }, data: { role: "ADMIN" } });
  }

  async promoteToAdminByUsername(username: string) {
    return db.user.update({ where: { username }, data: { role: "ADMIN" } });
  }
}

export const userService = new UserService();
