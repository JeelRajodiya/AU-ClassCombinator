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
    <div class="flex gap-8">
      <div class="flex flex-5 flex-col">
        <div class="flex gap-4 p-4 top-0 sticky z-10 bg-neutral">
          <LogoSmall class="w-fit pr-16" />
          <div class="flex flex-col w-full gap-2">
            <SearchField v-model="searchTerm" class="h-fit" />
            <ResultTabs v-model:active-tab="activeTab" />
          </div>

          <!-- <USeparator orientation="vertical" class="pt-48 h-96" /> -->
        </div>
      </div>
      <SearchStats class="flex-2 sticky top-8 py-4" />
    </div>
  </div>
</template>

<style lang="css" scoped></style>
