<script setup lang="ts">
import CourseManager from "~~/utils/courseManager";

const props = defineProps({
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
        :page="props.page"
        :course-manager="props.courseManager"
      />
    </div>
  </div>
</template>
