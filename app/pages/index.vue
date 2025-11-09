<script lang="ts" setup></script>

<template>
  <div class="landing-page">
    <div class="flex flex-col items-center">
      <Logo />
      <div class="text-xl flex flex-col items-center">
        <div><b>Winter 2026</b> Registration ahead?</div>
        <div class="text-muted">Class Combinator is here to help you out!</div>
      </div>
    </div>
    <LoginWithGoogle class="mt-8 w-64" />
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
</style>
