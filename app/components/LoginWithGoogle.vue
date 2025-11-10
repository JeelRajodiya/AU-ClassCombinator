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
    class="max-w-fit font-black text-xl px-4 py-3 rounded-xl"
    v-if="status !== 'authenticated'"
  >
    Login with Google
  </UButton>
  <UButton size="sm" @click="handleLogout" class="max-w-fit font-black" v-else>
    Logout
  </UButton>
</template>
