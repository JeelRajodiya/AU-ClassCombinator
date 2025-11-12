<template>
  <div class="logo" @click="navigateTo('/')" style="cursor: pointer">
    <div>Class</div>
    <div>Combinator</div>

    <div class="text-primary v2">Version 2</div>
  </div>
</template>

<style scoped>
.logo {
  font-weight: bold;
  letter-spacing: -0.1rem;
  height: fit-content;
}
.logo div {
  font-size: 1.5rem;
  line-height: 1.5rem;
}
</style>
