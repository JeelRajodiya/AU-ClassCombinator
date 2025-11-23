<script setup lang="ts">
import CourseManager from "~~/utils/courseManager";

const props = defineProps({
  selectedCoursesCount: {
    type: Number,
    required: true,
  },
  totalCredits: {
    type: Number,
    required: true,
  },
  totalCombinations: {
    type: Number,
    required: true,
  },
  combinationsLoading: {
    type: Boolean,
    required: false,
    default: false,
  },
  resetSelections: {
    type: Function,
    required: true,
  },
  page: {
    type: String as PropType<"search" | "combinations">,
    required: false,
    default: "search",
  },
  courseManager: {
    type: Object as PropType<CourseManager>,
    required: false,
  },
});

if (props.page === "combinations" && !props.courseManager) {
  throw new Error("courseManager prop is required when page is 'combinations'");
}
</script>

<template>
  <div class="page">
    <div class="flex align-top gap-8">
      <div class="flex flex-5 flex-col">
        <div class="flex gap-4">
          <LogoSmall class="w-fit pl-8 pr-16 top-8 sticky" />
          <div class="w-full">
            <slot />
          </div>
        </div>
      </div>
      <SearchStats
        class="flex-2 sticky top-0 py-8"
        :selected-courses-count="props.selectedCoursesCount"
        :total-credits="props.totalCredits"
        :total-combinations="props.totalCombinations"
        :combinations-loading="props.combinationsLoading"
        :reset-selections="props.resetSelections"
        :page="props.page"
        :course-manager="props.courseManager"
      />
    </div>
  </div>
</template>
