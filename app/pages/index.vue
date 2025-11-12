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

// on searchTerm change, we'll wait for 1500 of inactivity before applying any effects
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
  }, 1500);
});
</script>

<template>
  <div class="page center pb-24">
    <div class="layout center">
      <Logo class="logo" />
      <div class="center flex-col w-full gap-4 search">
        <SearchField v-model="searchTerm" />
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

<style scoped></style>
