<script setup lang="ts">
import type { ICourseDTO } from "~~/server/models/Course";
import CourseManager from "../../utils/courseManager";
import type { TimetableEvent } from "~/components/TimeTable.vue";

const { combinations } = useCombinations();
const { selectedCourseIds, clearCourses } = useSelectedCourses();

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
  body: selectedCourseIds.value,
});

const courseManager = computed(() => {
  return new CourseManager(courses.value || []);
});

const timeTables = computed(() => {
  const events: TimetableEvent[][] = [];
  combinations.value.forEach((combination) => {
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

const totalCombinations = computed(() => combinations.value.length);
const totalCredits = computed(() => {
  return (courses.value || []).reduce((sum, course) => sum + course.credits, 0);
});
</script>
<template>
  <SearchLayout
    :selected-courses-count="selectedCourseIds.length"
    :total-credits="totalCredits"
    :total-combinations="totalCombinations"
    :combinations-loading="false"
    :reset-selections="clearCourses"
  >
    <div class="flex flex-col gap-6 p-5 items-start">
      <TimeTable
        :events="timeTable"
        v-for="(timeTable, index) in timeTables"
        :key="index"
      />
    </div>
  </SearchLayout>
</template>
