<script setup lang="ts">
import { useSemesterStore } from "~/stores/semester";

// Use Pinia store
const semesterStore = useSemesterStore();

const {
  data: semesterList,
  error,
  pending,
} = await useFetch<string[]>("/api/semesters");

if (error.value) {
  console.error("Error fetching semester list:", error.value);
}
if (
  semesterList.value &&
  semesterList.value.length > 0 &&
  semesterList.value[0]
) {
  semesterStore.setSelectedSemester(semesterList.value[0]);
}
</script>

<style scoped></style>
<template>
  <USelect
    v-if="semesterList && semesterList.length > 0"
    :loading="pending"
    v-model="semesterStore.selectedSemester"
    :items="semesterList"
    arrow
    icon="i-lucide-book"
  />
  <div v-else class="text-error">No semesters available.</div>
</template>
