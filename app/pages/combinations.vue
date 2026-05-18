<script setup lang="ts">
useHead({
  titleTemplate: (title) =>
    title ? `${title} - Combinations` : "Combinations",
});
import type { TimetableEvent } from "~~/types/combinator";

// Use centralized store
const store = useCourseStore();
const {
  combinations,
  selectedCourseIds,
  selectedCourseDetails,
  courseManager,
  clearCourses,
  initializeCourse,
  fetchCourseDetails,
  fetchCombinations,
  needsDataRefresh,
  combinationsLoading,
} = store;

// Fetch course details and combinations if not already loaded
onMounted(async () => {
  if (
    selectedCourseDetails.value.length === 0 &&
    selectedCourseIds.value.length > 0
  ) {
    await fetchCourseDetails();
  }

  // If data was restored from storage, also fetch combinations
  if (needsDataRefresh.value && selectedCourseIds.value.length > 0) {
    await fetchCombinations();
    needsDataRefresh.value = false;
  }

  // Initialize section selections for all courses
  if (selectedCourseDetails.value.length > 0) {
    selectedCourseDetails.value.forEach((course) => {
      const allSectionIds = course.sections.map(
        (section) => `${course._id}.${section.sectionId}`
      );
      initializeCourse(course._id, allSectionIds);
    });
  }
});

const timeTables = computed(() => {
  const events: TimetableEvent[][] = [];
  combinations.value.forEach((combination) => {
    const combinationTable: TimetableEvent[] = [];
    Object.entries(combination).forEach(([courseId, sectionId]) => {
      const course = courseManager.value.getCourseById(courseId);
      if (!course) return;
      const sectionNo = courseManager.value.getSectionNoBySectionId(sectionId);
      console.log(`Course: ${course?.code}, Section: ${sectionNo}`);
      const slots = courseManager.value.getSlotsBySectionId(sectionId);
      if (!slots) return;

      slots.forEach((slot) => {
        combinationTable.push({
          id: `${course._id}-${sectionNo}-${slot.day}-${slot.startTime}`,
          title: `${course.code}-${sectionNo}`,
          day: slot.day,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
      });
    });
    events.push(combinationTable);
  });
  return events;
});

const totalCombinations = computed(() => combinations.value.length);
const totalCredits = computed(() => {
  return selectedCourseDetails.value.reduce(
    (sum, course) => sum + course.credits,
    0
  );
});
</script>

<template>
  <SearchLayout page="combinations">
    <div class="flex flex-col p-2 md:p-5 pb-28 md:pb-5 gap-4 md:gap-6" v-if="totalCombinations !== 0">
      <div class="font-bold text-2xl md:text-3xl text-center">
        Possible Schedules ({{ totalCombinations }})
      </div>
      <div v-if="combinationsLoading" class="flex justify-center p-8">
        <UIcon name="i-lucide-loader" size="48" class="animate-spin" />
      </div>
      <div class="flex flex-col gap-4 md:gap-6 items-start" v-else>
        <div
          v-for="(timeTable, index) in timeTables"
          :key="index"
          class="border border-default rounded-lg p-3 md:p-8 flex flex-col gap-3 md:gap-4 items-center w-full shadow-sm min-w-0"
        >
          <div class="text-center font-bold text-base md:text-lg">
            Combination {{ index + 1 }}
          </div>
          <TimeTable :events="timeTable" />
        </div>
      </div>
    </div>
    <div
      v-else
      class="flex justify-center items-center min-h-[60vh] md:h-128 p-6 md:p-8 flex-col gap-2 text-muted text-center"
    >
      <Icon name="streamline-plump-color:sad-face-flat" size="64"></Icon>
      <h1
        class="text-2xl md:text-4xl font-bold flex flex-row justify-center items-center gap-2"
      >
        No Combinations
      </h1>
      <div class="text-sm md:text-base">
        Please select different sections or courses to view combinations
      </div>
    </div>
  </SearchLayout>
</template>
