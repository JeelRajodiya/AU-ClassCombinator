<script setup lang="ts">
useHead({
  titleTemplate: (title) => (title ? `${title} - Search` : "Search"),
});
import type { ICourseDTO } from "~~/types/course";

const route = useRoute();
const router = useRouter();
const searchTerm = ref((route.query.q as string) || "");
const searchResults = ref<ICourseDTO[]>([]);
const loading = ref(false);

// Set loading to true if there's an initial search term
if (searchTerm.value.trim()) {
  loading.value = true;
}

const activeTab = ref<"search" | "selected">("search");

// Use centralized store
const store = useCourseStore();
const {
  selectedSemester,
  selectedCourseIds,
  selectedCourseDetails,
  detailsLoading,
  combinationsLoading,
  totalCombinations,
  isSelected,
  toggleCourse,
  clearCourses,
  fetchCourseDetails,
  fetchCombinations,
} = store;

const performSearch = async () => {
  if (!searchTerm.value.trim() || !selectedSemester.value) return;

  loading.value = true;
  searchResults.value = [];

  try {
    const results = await $fetch<ICourseDTO[]>("/api/search", {
      query: {
        q: searchTerm.value,
        semester: selectedSemester.value,
        page: 1,
      },
    });
    searchResults.value = results;
    // Update URL query parameters
    activeTab.value = "search";
    router.push({
      query: { q: searchTerm.value },
    });
  } catch (error) {
    console.error("Search error:", error);
    searchResults.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (searchTerm.value.trim()) {
    performSearch();
  }
  // Fetch details if we have selected courses (restoring state)
  if (selectedCourseIds.value.length > 0) {
    fetchCourseDetails();
  }
});

// Wrapper to handle toggling
const handleToggleCourse = (course: ICourseDTO) => {
  toggleCourse(course);
};

// Watch activeTab to fetch details when switching to "selected"
watch(activeTab, (newTab) => {
  if (newTab === "selected") {
    fetchCourseDetails();
  }
});

// Watch selectedCourseIds to fetch combinations
watch(
  selectedCourseIds,
  async () => {
    if (selectedCourseIds.value.length === 0) {
      return;
    }
    await fetchCombinations();
  },
  { deep: true }
);
</script>

<template>
  <SearchLayout page="search">
    <div class="flex flex-col w-full top-0 pt-8 sticky z-10 bg-default">
      <SearchField
        v-model="searchTerm"
        class="h-fit"
        :search-function="performSearch"
      />
      <ResultTabs v-model:active-tab="activeTab" />
    </div>
    <div class="p-2 flex flex-col gap-4" v-if="activeTab === 'search'">
      <CourseCard
        v-for="course in searchResults"
        :course="course"
        v-if="!loading && searchResults.length > 0"
        @select="handleToggleCourse(course)"
        class="cursor-pointer"
        :isSelected="isSelected(course._id)"
      />
      <div
        v-else-if="loading"
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
    <div class="p-2 flex flex-col gap-4" v-else-if="activeTab === 'selected'">
      <div v-if="detailsLoading" class="flex justify-center p-8">
        <UIcon name="i-lucide-loader" size="32" class="animate-spin" />
      </div>
      <CourseCard
        v-else-if="selectedCourseDetails.length > 0"
        v-for="course in selectedCourseDetails"
        :key="course.code"
        :course="course"
        @select="toggleCourse(course)"
        class="cursor-pointer"
        :isSelected="isSelected(course._id)"
      />
      <div
        v-else
        class="flex flex-col items-center justify-center h-96 text-muted gap-4 p-2"
      >
        <UIcon name="i-lucide-bookmark-minus" size="48" />
        <div>
          <p class="text-lg text-center">No selected courses</p>
          <p class="text-center">
            Click on a course card to select or deselect it.
          </p>
        </div>
      </div>
    </div>
  </SearchLayout>
</template>

<style lang="css" scoped></style>
