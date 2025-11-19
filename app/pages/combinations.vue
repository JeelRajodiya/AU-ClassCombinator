<script setup lang="ts">
import type { ICourseDTO } from "~~/server/models/Course";
import CourseManager from "../../utils/courseManager";

const { combinations, setCombinations } = useCombinations();
const { selectedCourseIds } = useSelectedCourses();

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
</script>
<template>
  {{ courses }}
  {{ combinations }}
</template>
