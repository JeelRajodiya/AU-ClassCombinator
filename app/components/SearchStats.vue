<script setup lang="ts">
const props = defineProps({
  totalCredits: {
    type: Number,
    required: true,
  },
  selectedCoursesCount: {
    type: Number,
    required: true,
  },
  totalCombinations: {
    type: Number,
    required: true,
  },
  resetSelections: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div class="flex flex-col gap-8 h-fit">
    <SemesterSwitch class="w-fit" />
    <USeparator orientation="horizontal" class="w-48 pt-16" />
    <div class="flex flex-col gap-4">
      <StatItem
        icon="i-lucide-coins"
        label="Total Credits:"
        :value="props.totalCredits"
      />
      <StatItem
        icon="i-lucide-book"
        label="Selected Courses:"
        :value="props.selectedCoursesCount"
      />
      <StatItem
        icon="i-lucide-combine"
        label="Total Combinations:"
        :value="props.totalCombinations"
      />
    </div>
    <div>
      <UButton
        label="Reset Selectiions"
        class="bg-error-300 mt-8"
        color="error"
        icon="i-lucide-refresh-ccw"
        variant="solid"
        size="sm"
        :disabled="props.selectedCoursesCount === 0"
        @click="props.resetSelections()"
      />
    </div>
  </div>
</template>

<style scoped>
/* .search-stats {
} */
</style>
