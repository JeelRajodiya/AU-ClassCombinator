// file: ~/server/api/auth/[...].ts
import GoogleProvider from "next-auth/providers/google";
import { NuxtAuthHandler } from "#auth";
import dbConnect from "~~/server/db";
import User from "~~/server/models/User";
import { log, time, timeEnd } from "console";

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
      // Removed database upsert to avoid blocking sign-in
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
    async session({ session, token }) {
      dbConnect().then(() => {
        // Fire-and-forget database update
        User.updateOne(
          { email: session.user?.email },
          { $inc: { sessionCalls: 1 } }
        ).catch((err) =>
          console.error("Failed to increment sessionCalls", err)
        );
      });

      return session;
    },
    /* on JWT token creation or mutation */
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        try {
          await dbConnect();

          // Upsert user into database lazily after sign-in
          await User.findOneAndUpdate(
            { email: user.email },
            {
              name: user.name,
              email: user.email,
            },
            { upsert: true, new: true }
          );

          //     console.log("User upserted:", { user });
        } catch (error) {
          console.error("Error upserting user:", error);
        }
      }
      return token;
    },
  },
});
