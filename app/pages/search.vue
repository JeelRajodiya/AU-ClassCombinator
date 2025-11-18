<script setup lang="ts">
import { log } from "console";
import type { ICourseDTO } from "~~/server/models/Course";

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
});
// have two tabs, all and selected
const selectedCourses = ref<ICourseDTO[]>([]);
// this will hold a shadow copy of selected courses when the selected tab is active
const shadowSelectedCourses = ref<ICourseDTO[]>([]);
watch(activeTab, (newTab) => {
  if (newTab === "selected") {
    shadowSelectedCourses.value = [...selectedCourses.value];
  } else {
    shadowSelectedCourses.value = [];
  }
});

const toggleCourse = (course: ICourseDTO) => {
  const index = selectedCourses.value.findIndex((c) => c.code === course.code);
  if (index > -1) {
    selectedCourses.value.splice(index, 1);
  } else {
    selectedCourses.value.push(course);
  }
};

const combinationsLoading = ref(false);

const totalCombinations = ref(0);

watch(
  selectedCourses,
  async () => {
    if (selectedCourses.value.length === 0) {
      totalCombinations.value = 0;
      return;
    }
    combinationsLoading.value = true;
    // create a list of ids of selected courses
    const ids = selectedCourses.value.map((course) => course._id);

    if (ids.length === 0) {
      totalCombinations.value = 0;
      return;
    }

    // now send post request to /api/combinations with the ids
    const response = await $fetch<any[]>("/api/combinations", {
      method: "POST",
      body: { ids },
    });
    // log("Combinations response:", response);
    totalCombinations.value = response.length;
    combinationsLoading.value = false;
  },
  { deep: true }
);
</script>

<template>
  <div class="page">
    <div class="flex align-top gap-8">
      <div class="flex flex-5 flex-col">
        <div class="flex gap-4">
          <LogoSmall class="w-fit pl-8 pr-16 top-8 sticky" />
          <div class="w-full">
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
                @select="toggleCourse($event)"
                class="cursor-pointer"
                :isSelected="
                  selectedCourses.some((c) => c.code === course.code)
                "
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
            <div
              class="p-2 flex flex-col gap-4"
              v-else-if="activeTab === 'selected'"
            >
              <CourseCard
                v-for="course in shadowSelectedCourses"
                v-if="shadowSelectedCourses.length > 0"
                :key="course.code"
                :course="course"
                @select="toggleCourse($event)"
                class="cursor-pointer"
                :isSelected="
                  selectedCourses.some((c) => c.code === course.code)
                "
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
          </div>

          <!-- <USeparator orientation="vertical" class="pt-48 h-96" /> -->
        </div>
      </div>
      <SearchStats
        class="flex-2 sticky top-0 py-8"
        :selected-courses-count="selectedCourses.length"
        :total-credits="
          selectedCourses.reduce((sum, course) => sum + course.credits, 0)
        "
        :total-combinations="totalCombinations"
        :combinations-loading="combinationsLoading"
        :reset-selections="
          () => {
            selectedCourses = [];
          }
        "
      />
    </div>
  </div>
</template>

<style lang="css" scoped></style>
