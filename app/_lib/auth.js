import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getGuest } from "./data-service";

const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const guest = await getGuest(credentials.email);
        if (!guest?.password) return null;

        const valid = await bcrypt.compare(
          credentials.password,
          guest.password,
        );
        if (!valid) return null;

        return {
          id: String(guest.id),
          name: guest.fullName,
          email: guest.email,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      return !!auth?.user;
    },
    async jwt({ token, user }) {
      if (user) token.guestId = user.id;
      return token;
    },
    async session({ session, token }) {
      session.user.guestId = token.guestId;
      return session;
    },
  },
  pages: { signIn: "/login" },
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth(authConfig);
