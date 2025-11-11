<script setup lang="ts">
// definePageMeta({
//   auth: { authenticatedOnly: true, navigateUnauthenticatedTo: "/Login" },
// });

const { getSession } = useAuth();
const session = await getSession();
console.log("Session in Index Page:", session);
const selectedSemester = ref();

const {
  data: semesterList,
  error,
  pending,
} = await useFetch<string[]>("/api/getSemesterList");

if (error.value) {
  console.error("Error fetching semester list:", error.value);
}
if (semesterList.value && semesterList.value.length > 0) {
  selectedSemester.value = semesterList.value[0];
}
</script>

<template>
  <div class="home flex-center">
    <div class="home-wrapper flex-center">
      <Logo />
      <div class="flex-center flex-col w-full gap-4">
        <UInput
          icon="i-lucide-search"
          size="xl"
          placeholder="Search courses..."
          variant="subtle"
          class="w-full"
        />
        <USelect
          :loading="pending"
          v-model="selectedSemester"
          :items="semesterList"
          arrow
          icon="i-lucide-book"
        />
      </div>
    </div>
    Hi {{ session?.user?.name || "Guest" }}! <LoginWithGoogle />
  </div>
</template>

<style scoped>
.home {
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  padding-bottom: 10rem;
}

.home-wrapper {
  gap: 1rem;
  flex-direction: column;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
