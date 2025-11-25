<script setup lang="ts">
import type { PropType } from "vue";
import type CourseManager from "~~/utils/courseManager";
import { useCourseSelectionStore } from "~/stores/courseSelection";
import { useSemesterStore } from "~/stores/semester";

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

// Use Pinia stores
const courseStore = useCourseSelectionStore();
const semesterStore = useSemesterStore();

const router = useRouter();
// back to search
const backToSearch = () => {
  // go back using router back
  router.back();
};

const removeCourse = (courseId: string) => {
  courseStore.removeCourse(courseId);
  courseStore.filterCombinationsBySections();
};

// Initialize selected sections for each course
const sectionSelections = computed(() => {
  if (props.page !== "combinations" || !props.courseManager) return {};

  const selections: Record<string, string[]> = {};

  props.courseManager.courses.forEach((course) => {
    const allSectionIds = course.sections.map(
      (section) => `${course._id}.${section.sectionId}`
    );

    // Initialize if not already done
    courseStore.initializeCourseSection(course._id, allSectionIds);

    // Get current selection
    selections[course._id] = courseStore.getSelectedSections(course._id);
  });

  return selections;
});

// Get section options for each course
const getSectionOptions = (courseId: string) => {
  if (!props.courseManager) return [];

  const course = props.courseManager.getCourseById(courseId);
  if (!course) return [];

  return course.sections.map((section) => ({
    label: `Section ${section.sectionId}`,
    value: `${courseId}.${section.sectionId}`,
  }));
};

// Handle section selection change
const handleSectionChange = (
  courseId: string,
  selectedValues: { label: string; value: string }[]
) => {
  const values = selectedValues.map((item) => item.value);
  courseStore.setSelectedSections(courseId, values);
  courseStore.filterCombinationsBySections();
};

// Get selected section objects for USelectMenu
const getSelectedSectionObjects = (courseId: string) => {
  const selectedValues = sectionSelections.value[courseId] || [];
  const options = getSectionOptions(courseId);
  return options.filter((option) => selectedValues.includes(option.value));
};
</script>

<template>
  <div class="flex flex-col gap-8 h-fit">
    <SemesterSwitch class="w-fit" v-if="props.page == 'search'" />

    <USeparator orientation="horizontal" class="w-48 pt-16" />
    <div class="flex flex-col gap-4">
      <StatItem
        icon="i-lucide-coins"
        label="Total Credits:"
        :value="courseStore.totalCredits"
      />
      <StatItem
        icon="i-lucide-book"
        label="Selected Courses:"
        :value="courseStore.selectedCoursesCount"
      />
      <StatItem
        icon="i-lucide-combine"
        label="Total Combinations:"
        :value="courseStore.totalCombinations"
        :isLoading="courseStore.combinationsLoading"
        :zeroIndicator="true"
      />
    </div>
    <UButton
      class="w-fit"
      label="Back to Search"
      color="secondary"
      icon="i-lucide-arrow-left"
      :disabled="
        courseStore.selectedCoursesCount == 0 ||
        courseStore.totalCombinations == 0
      "
      @click="backToSearch()"
      v-if="props.page == 'combinations'"
    />
    <div
      class="flex flex-col gap-4 w-fit"
      v-if="props.page == 'combinations'"
    ></div>
    <div class="flex flex-col gap-4 w-fit" v-if="props.page == 'search'">
      <UPopover arrow :content="{ side: 'top' }">
        <UButton
          label="Reset Selections"
          color="error"
          class="mt-8 w-fit"
          icon="i-lucide-refresh-ccw"
          variant="solid"
          size="xs"
          :disabled="courseStore.selectedCoursesCount === 0"
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
                  courseStore.clearCourses();
                  close();
                "
              />
            </div>
          </div>
        </template>
      </UPopover>
      <UTooltip
        :text="
          courseStore.selectedCoursesCount == 0
            ? 'Select courses to view combinations'
            : courseStore.totalCombinations == 0
            ? 'No valid combinations available for the selected courses'
            : 'View possible course combinations'
        "
      >
        <UButton
          label="View Schedules"
          trailing-icon="i-lucide-arrow-right"
          :disabled="
            courseStore.selectedCoursesCount == 0 ||
            courseStore.totalCombinations == 0
          "
          to="/combinations"
        />
      </UTooltip>
    </div>
    <div v-else class="flex flex-col gap-8 w-fit max-w-sm">
      <div
        v-for="course in courseManager!.courses"
        :key="course._id"
        class="flex flex-col gap-2"
      >
        <div class="flex gap-2 items-center justify-between">
          <div class="text-sm font-medium">
            {{ course.code }}
            <br />
            {{ course.name }}
          </div>
          <UButton
            icon="i-lucide-x"
            size="xs"
            color="error"
            variant="ghost"
            @click="removeCourse(course._id)"
          />
        </div>
        <USelectMenu
          :model-value="getSelectedSectionObjects(course._id)"
          @update:model-value="(value: any) => handleSectionChange(course._id, value)"
          multiple
          :search-input="false"
          :items="getSectionOptions(course._id)"
          placeholder="Select sections"
          class="w-full"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* .search-stats {
} */
</style>
