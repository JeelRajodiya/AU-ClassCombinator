<script setup lang="ts">
// definePageMeta({
//   auth: { authenticatedOnly: true, navigateUnauthenticatedTo: "/Login" },
// });

const { getSession } = useAuth();
const session = await getSession();
console.log("Session in Index Page:", session);
</script>

<template>
  <div>
    <Logo />
  </div>
  Hi {{ session?.user?.name || "Guest" }}!
  <LoginWithGoogle />
</template>

<style scoped></style>
