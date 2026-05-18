<script lang="ts" setup>
definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
});

const route = useRoute();
const router = useRouter();

const { data: semesters } = await useFetch<string[]>("/api/semesters", {
  default: () => ["Winter 2026"],
});
const latestSemester = computed(
  () => semesters.value?.[0] ?? "Winter 2026"
);

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
  <div class="landing-page px-4">
    <div class="wrapper">
      <div class="flex flex-col gap-4 items-center">
        <Logo />
        <div class="text-base md:text-xl flex flex-col items-center text-center">
          <div><b>{{ latestSemester }}</b> Registration ahead?</div>
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
  min-height: calc(100dvh - 4rem);
  width: 100%;
  flex-direction: column;
  padding-bottom: 4em;
}

@media (min-width: 768px) {
  .landing-page {
    padding-bottom: 10em;
  }
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  gap: 1.5rem;
}
</style>
