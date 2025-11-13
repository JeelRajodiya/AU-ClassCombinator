<script setup lang="ts">
const route = useRoute();
const searchTerm = ref((route.query.q as string) || "");
const { selectedSem, setSelectedSem } = useSelectedSemester();
const searchResults = ref<any[]>([]);
const debounceTimeout = ref<NodeJS.Timeout | null>(null);

const performSearch = async () => {
  if (!searchTerm.value.trim() || !selectedSem.value) return;

  try {
    const results = await $fetch("/api/search", {
      query: {
        q: searchTerm.value,
        semester: selectedSem.value,
        page: 1,
      },
    });
    searchResults.value = results as any[];
  } catch (error) {
    console.error("Search error:", error);
    searchResults.value = [];
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
          <LogoSmall class="w-fit pl-4 pr-16 top-4 sticky" />
          <div>
            <div class="flex flex-col w-full top-0 pt-4 sticky z-10 bg-default">
              <SearchField v-model="searchTerm" class="h-fit" />
              <ResultTabs v-model:active-tab="activeTab" />
            </div>
            <div class="space-y-4">
              <div
                v-for="course in searchResults"
                :key="course.code"
                class="p-4 border rounded"
              >
                <h3 class="font-bold">{{ course.code }}: {{ course.name }}</h3>
                <p>{{ course.description }}</p>
                <p>Credits: {{ course.credits }}</p>
                <p>Faculties: {{ course.faculties.join(", ") }}</p>
              </div>
            </div>
          </div>

          <!-- <USeparator orientation="vertical" class="pt-48 h-96" /> -->
        </div>
      </div>
      <SearchStats class="flex-2 sticky top-0 py-4" />
    </div>
  </div>
</template>

<style lang="css" scoped></style>
