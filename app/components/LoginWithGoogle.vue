<script setup lang="ts">
const { signIn, signOut, status } = useAuth();

const handleLogin = async () => {
  await signIn("google", { callbackUrl: "/", redirect: true });
};

const handleLogout = async () => {
  await signOut({ callbackUrl: "/login", redirect: true });
};
</script>

<template>
  <UButton
    size="lg"
    @click="handleLogin"
    class="max-w-fit font-black text-md px-4 py-1.5"
    v-if="status !== 'authenticated'"
    trailing-icon="i-streamline-logos:google-logo-solid"
  >
    Login
  </UButton>
  <UButton size="sm" @click="handleLogout" class="max-w-fit font-black" v-else>
    Logout
  </UButton>
</template>
