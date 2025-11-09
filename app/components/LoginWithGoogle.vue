<script setup lang="ts">
definePageMeta({
  auth: { unauthenticatedOnly: true, navigateAuthenticatedTo: "/" },
});
const { signIn } = useAuth();

const handleLogin = async () => {
  await signIn("google", { callbackUrl: "/" });
};
</script>

<template>
  <UButton
    variant="solid"
    color="primary"
    class="w-full justify-center text-xl font-bold p-2"
    @click="handleLogin"
  >
    Login with Google
  </UButton>
</template>
