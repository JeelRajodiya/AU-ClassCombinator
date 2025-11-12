<script setup lang="ts">
const { selectedSem, setSelectedSem } = useSelectedSemester();

const {
  data: semesterList,
  error,
  pending,
} = await useFetch<string[]>("/api/getSemesterList");

if (error.value) {
  console.error("Error fetching semester list:", error.value);
}
if (
  semesterList.value &&
  semesterList.value.length > 0 &&
  semesterList.value[0]
) {
  setSelectedSem(semesterList.value[0]);
}
</script>

<style scoped></style>
<template>
  <USelect
    v-if="semesterList && semesterList.length > 0"
    :loading="pending"
    v-model="selectedSem"
    :items="semesterList"
    arrow
    icon="i-lucide-book"
  />
  <div v-else class="text-red-500">No semesters available.</div>
</template>
