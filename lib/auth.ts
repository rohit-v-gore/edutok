import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const providers: NextAuthOptions["providers"] = [];

if (googleEnabled) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

// Guest sign-in so the app is usable before Google OAuth credentials are configured.
providers.push(
  CredentialsProvider({
    id: "guest",
    name: "Guest",
    credentials: { name: { label: "Name", type: "text" } },
    async authorize(credentials) {
      const name = (credentials?.name || "").trim().slice(0, 40) || "Curious Learner";
      return { id: `guest-${Math.random().toString(36).slice(2, 10)}`, name, email: null, image: null };
    },
  }),
);

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET ?? (process.env.NODE_ENV !== "production" ? "edutok-dev-secret-change-me" : undefined),
  callbacks: {
    async jwt({ token, account }) {
      if (account) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub;
        (session.user as { provider?: string }).provider = token.provider as string | undefined;
      }
      return session;
    },
  },
};
