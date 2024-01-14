import { NextAuthOptions, User } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import GitHubProvider, { GithubProfile } from "next-auth/providers/github";
import GoogleProvider, { GoogleProfile } from "next-auth/providers/google";
import CredentialsProvider, {
  CredentialsProviderType,
} from "next-auth/providers/credentials";
import User from "@/app/(models)/User";

export const options: NextAuthOptions = {
  providers: [
    GitHubProvider({
      profile(profile: any) {
        console.log("GitHub Profile: ", profile);

        let userRole = "GitHub User";
        if (profile?.email === "joram.teneza@gmail.com") {
          userRole = "admin";
        }

        return {
          ...profile,
          role: userRole,
        };
      },
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      profile(profile: GoogleProfile) {
        console.log("Google Profile: ", profile);

        let userRole = "Google User"; // Define userRole for Google users

        return {
          ...profile,
          id: profile.sub,
          role: userRole,
        };
      },
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email",
          type: "text",
          placeholder: "your-email",
        },
        password: {
          label: "password",
          type: "password",
          placeholder: "your-password",
        },
      },
      async authorize(credentials: any) {
        try {
          const foundUser = await User.findOne({ email: credentials.email });
        } catch (error) {
          console.log(error);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role;
      return session;
    },
  },
};
