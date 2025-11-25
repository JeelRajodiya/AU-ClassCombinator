// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@sidebase/nuxt-auth", "nuxt-gtag"],
  css: ["~/assets/css/main.css"],
  gtag: {
    enabled: true,
    id: process.env.NUXT_PUBLIC_GTAG_ID,
  },
  app: {
    head: {
      title: "Class Combinator",
      meta: [
        {
          name: "description",
          content:
            "AU Class Combinator, schedule planner better than auris ! Find the perfect class schedule at Ahmedabad University with Class Combinator. Our easy-to-use course combinator tool generates all possible class combinations, ensuring that you can create a schedule without any clashes. Select your preferred courses and let ClassCombinator do the rest. Start planning your ideal semester today!",
        },
        {
          name: "keywords",
          content:
            "Ahmedabad University, AU, Class Combinator, Course Scheduler, Timetable Generator, Auris Directory, Course Combinations, Class Schedule Planner, Class Combinator, AU Class Combinator, ClassCombinator",
        },
        {
          name: "google-site-verification",
          content: "0U-oiurYHf7uKHEQbrNhqVIe69pMrU4FYvTA92mnvos",
        },
      ],
    },
  },
  runtimeConfig: {
    // Private keys - only available on the server side
    authSecret: process.env.NUXT_AUTH_SECRET,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongoUri: process.env.MONGO_URI,

    // Public keys - exposed to the client side
    public: {
      authOrigin: process.env.AUTH_ORIGIN,
    },
  },

  auth: {
    isEnabled: true,
    disableServerSideAuth: false,
    originEnvKey: "AUTH_ORIGIN",

    provider: {
      type: "authjs",
      trustHost: false,
      defaultProvider: "google",
    },
    globalAppMiddleware: false,
  },
});
