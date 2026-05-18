<script setup lang="ts">
import SemesterSwitch from "~/components/SemesterSwitch.vue";

const { getSession } = useAuth();
const session = await getSession();
console.log("Session in Index Page:", session);

// Use centralized store
const { selectedSemester } = useCourseStore();

const searchTerm = ref("");
const performSearch = () => {
  if (searchTerm.value.trim() === "") return;

  const query = new URLSearchParams();
  query.append("q", searchTerm.value);

  navigateTo(`/search?${query.toString()}`);
};

// Debounce the searchTerm effect
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchTerm, (newTerm) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    performSearch();
  }, 3000);
});
</script>

<template>
  <div class="page center pb-12 md:pb-24 px-4">
    <div class="layout center w-full max-w-xl">
      <Logo class="logo" />
      <SearchField v-model="searchTerm" :search-function="performSearch" />
      <SemesterSwitch />
    </div>
  </div>
</template>

<style scoped></style>
