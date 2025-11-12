<script setup lang="ts">
// definePageMeta({
//   auth: { authenticatedOnly: true, navigateUnauthenticatedTo: "/Login" },
// });

const { getSession } = useAuth();
const session = await getSession();
console.log("Session in Index Page:", session);
const { selectedSem, setSelectedSem } = useSelectedSemester();

const {
  data: semesterList,
  error,
  pending,
} = await useFetch<string[]>("/api/getSemesterList");

if (error.value) {
  console.error("Error fetching semester list:", error.value);
}
if (
  semesterList.value &&
  semesterList.value.length > 0 &&
  semesterList.value[0]
) {
  setSelectedSem(semesterList.value[0]);
}

const searchTerm = ref("");

// on searchTerm change, we'll wait for 300ms of inactivity before applying any effects
// debounce the searchTerm effect
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchTerm, (newTerm) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    // redirect to /search-results with query params searchTerm and selectedSemester
    if (newTerm.trim() !== "") {
      const query = new URLSearchParams();
      query.append("q", newTerm);
      if (selectedSem.value) {
        query.append("semester", selectedSem.value);
      }
      navigateTo(`/search?${query.toString()}`);
    }
  }, 300);
});
</script>

<template>
  <div class="page center">
    <div class="layout center">
      <Logo class="logo" />
      <div class="center flex-col w-full gap-4 search">
        <UInput
          icon="i-lucide-search"
          size="xl"
          placeholder="Search courses..."
          variant="subtle"
          class="w-full"
          v-model="searchTerm"
        />
        <USelect
          v-if="semesterList && semesterList.length > 0"
          :loading="pending"
          v-model="selectedSem"
          :items="semesterList"
          arrow
          icon="i-lucide-book"
        />
        <div v-else class="text-red-500">No semesters available.</div>
      </div>
    </div>
    Hi {{ session?.user?.name || "Guest" }}! <LoginWithGoogle />
  </div>
</template>

<style scoped>
.page {
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  padding-bottom: 10rem;
}

.layout {
  gap: 1rem;
  flex-direction: column;
  transition: all 0.4s ease-in-out;
}

.logo {
  transition: all 0.4s ease-in-out;
}

.search {
  transition: all 0.4s ease-in-out;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
