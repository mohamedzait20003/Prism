import NextAuth, { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import "@/models/auth";
import { encrypt } from "@/lib/encrypt";
import { userService } from "@/services/user.service";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: "read:user user:email repo admin:repo_hook" },
      },
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await userService.findByEmail(credentials.email);
        if (!user || !user.passwordHash) return null;
        const valid = await userService.verifyPassword(user, credentials.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        if (!account.access_token || !profile || !user.email) return false;
        const githubId = String((profile as { id?: number | string }).id ?? "");
        const githubLogin = (profile as { login?: string }).login ?? "";
        await userService.upsertFromGitHub({
          email: user.email,
          name: user.name,
          image: user.image,
          githubId,
          githubLogin,
          githubToken: encrypt(account.access_token),
        });
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await userService.findByEmail(user.email);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role as "CLIENT" | "ADMIN";
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id ?? token.sub ?? "";
      session.user.role = token.role ?? "CLIENT";
      return session;
    },
  },

  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
