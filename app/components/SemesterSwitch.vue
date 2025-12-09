<script setup lang="ts">
// Use centralized store
const { selectedSemester, setSelectedSemester } = useCourseStore();

const {
  data: semesterList,
  error,
  pending,
} = await useFetch<string[]>("/api/semesters");

if (error.value) {
  console.error("Error fetching semester list:", error.value);
}

// Only set to first semester if:
// 1. Semester list is available
// 2. Current selectedSemester is not in the list (invalid/expired) or is the default placeholder
if (
  semesterList.value &&
  semesterList.value.length > 0 &&
  semesterList.value[0] &&
  !semesterList.value.includes(selectedSemester.value)
) {
  setSelectedSemester(semesterList.value[0]);
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
