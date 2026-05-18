<script setup lang="ts">
// Use centralized store
const { selectedSemester, setSelectedSemester, selectedCourseIds } =
  useCourseStore();

const {
  data: semesterList,
  error,
  pending,
} = await useFetch<string[]>("/api/semesters");

if (error.value) {
  console.error("Error fetching semester list:", error.value);
}

// Default to the latest semester (first in the list) when:
// - the stored selection is missing from the list (invalid/expired), or
// - the user has no courses selected (no in-progress selection to preserve)
if (
  semesterList.value &&
  semesterList.value.length > 0 &&
  semesterList.value[0]
) {
  const storedSemesterInvalid = !semesterList.value.includes(
    selectedSemester.value
  );
  const noCoursesSelected = selectedCourseIds.value.length === 0;
  if (storedSemesterInvalid || noCoursesSelected) {
    setSelectedSemester(semesterList.value[0]);
  }
}
</script>

<style scoped></style>
<template>
  <USelect
    v-if="semesterList && semesterList.length > 0"
    :loading="pending"
    v-model="selectedSemester"
    :items="semesterList"
    arrow
    icon="i-lucide-book"
  />
  <div v-else class="text-error">No semesters available.</div>
</template>
