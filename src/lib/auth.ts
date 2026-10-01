import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  shopId: string;
  shopName: string;
};

declare module "next-auth" {
  interface Session {
    user: AppUser;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        shop: { label: "Shop", type: "text" },
        email: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const shopName = String(credentials?.shop ?? "").trim();
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!shopName || !email || !password) return null;

        const shops = await prisma.$queryRaw<Array<{ id: string }>>`
          SELECT id FROM Shop WHERE name = ${shopName} COLLATE NOCASE LIMIT 1
        `;
        const shopId = shops[0]?.id;
        if (!shopId) return null;

        const user = await prisma.user.findFirst({
          where: { shopId, email },
          include: { shop: true },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          shopId: user.shopId,
          shopName: user.shop.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AppUser;
        token.id = u.id;
        token.role = u.role;
        token.shopId = u.shopId;
        token.shopName = u.shopName;
      }
      return token;
    },
    async session({ session, token }) {
      const user: AppUser = {
        id: String(token.id),
        email: String(token.email ?? ""),
        name: String(token.name ?? ""),
        role: token.role as UserRole,
        shopId: String(token.shopId),
        shopName: String(token.shopName),
      };
      session.user = user as typeof session.user;
      return session;
    },
  },
});
