// file: ~/server/api/auth/[...].ts
import GoogleProvider from "next-auth/providers/google";
import { NuxtAuthHandler } from "#auth";

if (!process.env.NUXT_AUTH_SECRET) {
  throw new Error("NUXT_AUTH_SECRET is not defined in environment variables");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_SECRET is not defined in environment variables"
  );
}

export default NuxtAuthHandler({
  secret: process.env.NUXT_AUTH_SECRET,
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    /* on before signin */
    async signIn({ user, account, profile, email, credentials }) {
      console.log("SignIn callback:", { user });
      return true;
    },
    /* on redirect to another url */

    // async redirect({ url, baseUrl }) {
    //   console.log("Redirect callback:", { url, baseUrl });
    //   // Allows relative callback URLs
    //   if (url.startsWith("/")) return `${baseUrl}${url}`;
    //   // Allows callback URLs on the same origin
    //   else if (new URL(url).origin === new URL(baseUrl).origin) return url;
    //   return baseUrl;
    // },
    /* on session retrival */
    async session({ session, user, token }) {
      return session;
    },
    /* on JWT token creation or mutation */
    async jwt({ token, user, account, profile, isNewUser }) {
      return token;
    },
  },
});
