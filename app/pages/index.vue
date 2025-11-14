<script setup lang="ts">
import SemesterSwitch from "~/components/SemesterSwitch.vue";

const { getSession } = useAuth();
const session = await getSession();
console.log("Session in Index Page:", session);
const { selectedSem } = useSelectedSemester();

const searchTerm = ref("");
const performSearch = () => {
  if (searchTerm.value.trim() === "") return;

  const query = new URLSearchParams();
  query.append("q", searchTerm.value);

  navigateTo(`/search?${query.toString()}`);
};
// on searchTerm change, we'll wait for 1500 of inactivity before applying any effects
// debounce the searchTerm effect
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
watch(searchTerm, (newTerm) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  searchTimeout = setTimeout(() => {
    // redirect to /search-results with query params searchTerm and selectedSemester
    performSearch();
  }, 3000);
});
</script>

<template>
  <div class="page center pb-24">
    <div class="layout center">
      <Logo class="logo" />
      <SearchField v-model="searchTerm" :search-function="performSearch" />
      <SemesterSwitch />
      <!-- <div class="center flex-col w-full gap-4 search"></div> -->
    </div>
    <!-- Hi {{ session?.user?.name || "Guest" }}! <LoginWithGoogle /> -->
  </div>
</template>

<style scoped></style>
