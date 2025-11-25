<script lang="ts" setup>
definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
});

const route = useRoute();
const router = useRouter();

onMounted(() => {
  // Clean up the URL if the callbackUrl is just the homepage
  if (route.query.callbackUrl) {
    const callbackUrl = route.query.callbackUrl as string;
    // Check for various forms of the homepage URL
    if (
      callbackUrl === "/" ||
      callbackUrl === window.location.origin ||
      callbackUrl === window.location.origin + "/"
    ) {
      const query = { ...route.query };
      delete query.callbackUrl;
      router.replace({ query });
    }
  }
});
</script>

<template>
  <div class="landing-page">
    <div class="wrapper">
      <div class="flex flex-col gap-4">
        <Logo />
        <div class="text-xl flex flex-col items-center">
          <div><b>Winter 2026</b> Registration ahead?</div>
          <div class="text-muted">
            Class Combinator is here to help you out!
          </div>
        </div>
      </div>
      <LoginWithGoogle />
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  flex-direction: column;
  padding-bottom: 10em;
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min-content;
  gap: 1.5rem;
}
</style>
