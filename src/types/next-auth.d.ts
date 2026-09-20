import "next-auth";
import "next-auth/jwt";

/**
 * NextAuth type augmentation — adds `id` to the session user and keeps
 * the credentials user shape consistent across the app.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}
