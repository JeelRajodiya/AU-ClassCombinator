<script setup lang="ts">
useHead({
  titleTemplate: (title) =>
    title ? `${title} - Combinations` : "Combinations",
});
import type { ICourseDTO } from "~~/types/course";
import CourseManager from "../../utils/courseManager";
import type { TimetableEvent, AssignmentType } from "~~/types/combinator";
import { useCourseSelectionStore } from "~/stores/courseSelection";

// Use Pinia store
const courseStore = useCourseSelectionStore();

// the combinations will look like this
// [ {course_id: course_id.section_no, course2_id: course2_id.section_no, course3_id: course3_id.section_no},
//   {course_id: course_id.section_no, course2_id: course2_id.section_no, course3_id: course3_id.section_no},
//   ...
// ]

// now the courses will look like
// [
// { _id: course_id, code: course_code, name: course_name, sections: [{section_no: section_no, time_slots: [{day: day, start_time: start_time, end_time: end_time}]}] }
// ...
// ]

const { data: courses } = await useFetch<ICourseDTO[]>("/api/courses", {
  method: "POST",
  body: courseStore.selectedCourseIds,
});

const courseManager = computed(() => {
  return new CourseManager(courses.value || []);
});

// Initialize section selections for all courses
onMounted(() => {
  if (courses.value) {
    courses.value.forEach((course) => {
      const allSectionIds = course.sections.map(
        (section) => `${course._id}.${section.sectionId}`
      );
      courseStore.initializeCourseSection(course._id, allSectionIds);
    });
  }
});

const timeTables = computed(() => {
  const events: TimetableEvent[][] = [];
  courseStore.combinations.forEach((combination: AssignmentType) => {
    // combination is an assignment type, which is an object
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
</script>
<template>
  <SearchLayout :course-manager="courseManager" page="combinations">
    <div class="flex flex-col p-5 gap-6">
      <div class="font-bold text-3xl text-center">
        Possible Schedules ({{ courseStore.totalCombinations }})
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
