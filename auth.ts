import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// Only the owner (matched by GitHub username) may sign in.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    signIn({ profile }) {
      const admin = process.env.ADMIN_GITHUB_USERNAME?.toLowerCase();
      const login = (profile as { login?: string } | undefined)?.login?.toLowerCase();
      return !!admin && login === admin;
    },
  },
});
