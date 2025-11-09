<script lang="ts" setup>
definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/Home" },
});
</script>

<template>
  <div class="landing-page">
    <div class="wrapper">
      <Logo />
      <div class="text-xl flex flex-col items-center">
        <div><b>Winter 2026</b> Registration ahead?</div>
        <div class="text-muted">Class Combinator is here to help you out!</div>
      </div>

      <LoginWithGoogle class="mt-8 w-64" />
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
}

.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min-content;
}
</style>
