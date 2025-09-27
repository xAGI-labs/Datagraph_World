import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log("SignIn callback:", { user, account, profile, email });
      return true;
    },
    session: async ({ session, user }: any) => {
      console.log("Session callback:", { session, user });
      if (session?.user) {
        session.user.id = user.id;

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            walletAddress: true,
            vibePoints: true,
            hasOnboarded: true,
          },
        });

        if (dbUser) {
          session.user.walletAddress = dbUser.walletAddress;
          session.user.vibePoints = dbUser.vibePoints;
          session.user.hasOnboarded = dbUser.hasOnboarded;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Redirect errors back to signin page
  },
  session: {
    strategy: "database" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
