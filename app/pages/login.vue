<script lang="ts" setup>
// definePageMeta({
//   auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
// });
</script>

<template>
  <div class="landing-page">
    <div class="wrapper">
      <div>
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
