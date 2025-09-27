import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      walletAddress?: string | null;
      vibePoints?: number;
      hasOnboarded?: boolean;
    };
  }

  interface User {
    id: string;
    walletAddress?: string | null;
    vibePoints?: number;
    hasOnboarded?: boolean;
  }
}
