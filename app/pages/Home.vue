<script setup lang="ts">
const { getSession } = useAuth();
const session = await getSession();
</script>

<template>
  <div>
    <Logo />
  </div>
  Hi {{ session?.user?.name || "Guest" }}!
  <LoginWithGoogle />
</template>

<style scoped></style>
