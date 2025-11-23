<script setup lang="ts">
import { log } from "console";
import type { ICourseDTO } from "~~/types/course";

const route = useRoute();
const router = useRouter();
const searchTerm = ref((route.query.q as string) || "");
const { selectedSem, setSelectedSem } = useSelectedSemester();
const searchResults = ref<ICourseDTO[]>([]);
const loading = ref(false);

// Set loading to true if there's an initial search term
if (searchTerm.value.trim()) {
  loading.value = true;
}

const activeTab = ref<"search" | "selected">("search");

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
    fetchSelectedDetails();
  }
});

// Global selected courses state
const { selectedCourseIds, toggleCourse, isSelected, clearCourses } =
  useSelectedCourses();

// Local details for selected courses (fetched only when needed)
const selectedCourseDetails = ref<ICourseDTO[]>([]);
const detailsLoading = ref(false);

const fetchSelectedDetails = async () => {
  if (selectedCourseIds.value.length === 0) {
    selectedCourseDetails.value = [];
    return;
  }
  detailsLoading.value = true;
  try {
    const courses = await $fetch<ICourseDTO[]>("/api/courses", {
      method: "POST",
      body: selectedCourseIds.value,
    });
    selectedCourseDetails.value = courses;
  } catch (error) {
    console.error("Error fetching selected course details:", error);
  } finally {
    detailsLoading.value = false;
  }
};

// Wrapper to handle toggling and updating local details immediately
const handleToggleCourse = (course: ICourseDTO) => {
  if (isSelected(course._id)) {
    // Removing
    toggleCourse(course._id);
    // Remove from details if present
    selectedCourseDetails.value = selectedCourseDetails.value.filter(
      (c) => c._id !== course._id
    );
  } else {
    // Adding
    toggleCourse(course._id);
    // Add to details if not already present
    if (!selectedCourseDetails.value.some((c) => c._id === course._id)) {
      selectedCourseDetails.value.push(course);
    }
  }
};

// Watch activeTab to fetch details when switching to "selected"
watch(activeTab, (newTab) => {
  if (newTab === "selected") {
    fetchSelectedDetails();
  }
});

const combinationsLoading = ref(false);
const { combinations, setCombinations } = useCombinations();
const totalCombinations = computed(() => combinations.value.length);

// Watch selectedCourseIds to fetch combinations
watch(
  selectedCourseIds,
  async () => {
    if (selectedCourseIds.value.length === 0) {
      setCombinations([]);
      // Only clear details if NOT in selected tab to maintain view
      if (activeTab.value !== "selected") {
        selectedCourseDetails.value = [];
      }
      return;
    }

    // We do NOT re-fetch details here if activeTab is 'selected'.
    // This ensures that deselected courses remain visible until the user leaves the tab.
    // When switching back to 'selected' tab, the watch(activeTab) will trigger a fresh fetch.

    combinationsLoading.value = true;
    const ids = selectedCourseIds.value;

    // now send post request to /api/combinations with the ids
    const response = await $fetch<any[]>("/api/combinations", {
      method: "POST",
      body: { ids },
    });
    // log("Combinations response:", response);
    setCombinations(response);
    combinationsLoading.value = false;
  },
  { deep: true }
);
</script>

<template>
  <SearchLayout
    :selected-courses-count="selectedCourseIds.length"
    :total-credits="
      selectedCourseDetails.reduce((sum, course) => sum + course.credits, 0)
    "
    :total-combinations="totalCombinations"
    :combinations-loading="combinationsLoading"
    :reset-selections="clearCourses"
    page="search"
  >
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
        @select="toggleCourse(course._id)"
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
