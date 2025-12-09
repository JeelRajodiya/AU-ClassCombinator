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
} = store;

// Fetch course details if not already loaded
onMounted(async () => {
  if (
    selectedCourseDetails.value.length === 0 &&
    selectedCourseIds.value.length > 0
  ) {
    await fetchCourseDetails();
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
    <div class="flex flex-col p-5 gap-6">
      <div class="font-bold text-3xl text-center">
        Possible Schedules ({{ totalCombinations }})
      </div>
      <div class="flex flex-col gap-6 items-start">
        <div
          v-for="(timeTable, index) in timeTables"
          :key="index"
          class="border border-default rounded-lg p-8 flex flex-col gap-4 items-center w-full shadow-sm"
        >
          <div class="text-center font-bold text-lg">
            Combination {{ index + 1 }}
          </div>
          <TimeTable :events="timeTable" />
        </div>
      </div>
    </div>
  </SearchLayout>
</template>
