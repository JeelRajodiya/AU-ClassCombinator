<script setup lang="ts">
import type { ICourseDTO } from "~~/server/models/Course";

const route = useRoute();
const router = useRouter();
const searchTerm = ref((route.query.q as string) || "");
const { selectedSem, setSelectedSem } = useSelectedSemester();
const searchResults = ref<ICourseDTO[]>([]);
const debounceTimeout = ref<NodeJS.Timeout | null>(null);
const loading = ref(false);

// Set loading to true if there's an initial search term
if (searchTerm.value.trim()) {
  loading.value = true;
}

const performSearch = async () => {
  if (!searchTerm.value.trim() || !selectedSem.value) return;

  loading.value = true;
  searchResults.value = [];

  try {
    const results = await $fetch<ICourseDTO[]>("/api/search", {
      query: {
        q: searchTerm.value,
        semester: selectedSem.value,
        page: 1,
      },
    });
    searchResults.value = results;
    // Update URL query parameters
    router.push({
      query: { q: searchTerm.value, semester: selectedSem.value },
    });
  } catch (error) {
    console.error("Search error:", error);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

watch([searchTerm, selectedSem], () => {
  if (debounceTimeout.value) clearTimeout(debounceTimeout.value);
  debounceTimeout.value = setTimeout(performSearch, 1500);
});

// Initial search if searchTerm is present
onMounted(() => {
  if (searchTerm.value.trim()) {
    performSearch();
  }
});

onUnmounted(() => {
  if (debounceTimeout.value) clearTimeout(debounceTimeout.value);
});
// have two tabs, all and selected
const activeTab = ref<"all" | "selected">("all");
</script>

<template>
  <div class="page">
    <div class="flex align-top gap-8">
      <div class="flex flex-5 flex-col">
        <div class="flex gap-4">
          <LogoSmall class="w-fit pl-8 pr-16 top-8 sticky" />
          <div class="w-full">
            <div class="flex flex-col w-full top-0 pt-8 sticky z-10 bg-default">
              <SearchField v-model="searchTerm" class="h-fit" />
              <ResultTabs v-model:active-tab="activeTab" />
            </div>
            <div
              class="p-2 flex flex-col gap-4"
              v-if="!loading && searchResults.length > 0"
            >
              <CourseCard
                v-for="course in searchResults"
                :course="course"
                v-if="activeTab === 'all'"
              />
              <div v-if="activeTab === 'selected'">
                <!-- Placeholder for selected courses -->
                <p class="text-muted">Selected courses will appear here.</p>
              </div>
            </div>
            <div
              v-if="loading"
              class="flex flex-col items-center justify-center h-96 w-full text-muted gap-4 p-2"
            >
              <UIcon name="i-lucide-loader" size="48" class="animate-spin" />
              <p class="text-lg">Loading results...</p>
            </div>
            <div
              v-else-if="searchResults.length == 0"
              class="flex flex-col items-center justify-center h-96 text-muted gap-4 p-2"
            >
              <UIcon name="i-lucide-search" size="48" />
              <p class="text-lg">No results found</p>
            </div>
          </div>

          <!-- <USeparator orientation="vertical" class="pt-48 h-96" /> -->
        </div>
      </div>
      <SearchStats class="flex-2 sticky top-0 py-8" />
    </div>
  </div>
</template>

<style lang="css" scoped></style>
