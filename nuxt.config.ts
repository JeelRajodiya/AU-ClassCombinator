// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@sidebase/nuxt-auth"],
  css: ["~/assets/css/main.css"],
  app: {
    head: {
      title: "Class Combinator",
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
