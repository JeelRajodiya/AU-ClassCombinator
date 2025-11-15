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
    <div class="flex flex-col gap-4 w-fit">
      <UPopover arrow :content="{ side: 'top' }">
        <UButton
          label="Reset Selections"
          color="error"
          class="mt-8 w-fit"
          icon="i-lucide-refresh-ccw"
          variant="solid"
          size="xs"
          :disabled="props.selectedCoursesCount === 0"
        />
        <template #content="{ close }">
          <div class="p-4 max-w-xs shadow-lg border border-accented rounded-md">
            <p class="mb-2 text-center">Are you sure?</p>
            <div class="flex justify-end gap-2">
              <UButton
                label="Cancel"
                variant="ghost"
                color="neutral"
                size="sm"
                @click="close"
              />
              <UButton
                label="Confirm"
                color="error"
                variant="solid"
                size="sm"
                @click="
                  props.resetSelections();
                  close();
                "
              />
            </div>
          </div>
        </template>
      </UPopover>
      <UButton label="View Schedules" trailing-icon="i-lucide-arrow-right" />
    </div>
  </div>
</template>

<style scoped>
/* .search-stats {
} */
</style>
