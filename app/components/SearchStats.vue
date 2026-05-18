<script setup lang="ts">
import type { PropType } from "vue";

const props = defineProps({
  page: {
    type: String as PropType<"search" | "combinations">,
    required: false,
    default: "search",
  },
});

// Use centralized store instead of props
const store = useCourseStore();
const {
  totalCredits,
  selectedCoursesCount,
  totalCombinations,
  combinationsLoading,
  clearCourses,
  courseManager,
  selectedSections,
  removeCourse,
  initializeCourse,
  setSelectedSections,
  getSelectedSections,
  filterCombinationsBySections,
  fetchCombinations,
} = store;

const router = useRouter();

const backToSearch = () => {
  router.back();
};

const handleRemoveCourse = async (courseId: string) => {
  removeCourse(courseId);
  await fetchCombinations();
  filterCombinationsBySections();
};

// Initialize selected sections for each course
const sectionSelections = computed(() => {
  if (props.page !== "combinations") return {};

  const selections: Record<string, string[]> = {};

  courseManager.value.courses.forEach((course) => {
    const allSectionIds = course.sections.map(
      (section) => `${course._id}.${section.sectionId}`
    );

    // Initialize if not already done
    initializeCourse(course._id, allSectionIds);

    // Get current selection
    selections[course._id] = getSelectedSections(course._id);
  });

  return selections;
});

// Get section options for each course
const getSectionOptions = (courseId: string) => {
  const course = courseManager.value.getCourseById(courseId);
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
  setSelectedSections(courseId, values);
  filterCombinationsBySections();
};

// Get selected section objects for USelectMenu
const getSelectedSectionObjects = (courseId: string) => {
  const selectedValues = sectionSelections.value[courseId] || [];
  const options = getSectionOptions(courseId);
  return options.filter((option) => selectedValues.includes(option.value));
};
</script>

<template>
  <div class="flex flex-col gap-2 md:gap-8">
    <SemesterSwitch class="w-fit" v-if="props.page == 'search'" />

    <USeparator orientation="horizontal" class="w-48 hidden md:block md:pt-16" />
    <div class="flex flex-col gap-1 md:gap-4">
      <StatItem
        icon="i-lucide-coins"
        label="Total Credits:"
        :value="totalCredits"
      />
      <StatItem
        icon="i-lucide-book"
        label="Selected Courses:"
        :value="selectedCoursesCount"
      />
      <StatItem
        icon="i-lucide-combine"
        label="Total Combinations:"
        :value="totalCombinations"
        :isLoading="combinationsLoading"
        :zeroIndicator="true"
      />
    </div>
    <UButton
      class="hidden md:flex w-fit"
      label="Back to Search"
      color="secondary"
      icon="i-lucide-arrow-left"
      :disabled="selectedCoursesCount == 0 || totalCombinations == 0"
      @click="backToSearch()"
      v-if="props.page == 'combinations'"
    />

    <!-- Mobile floating back button (combinations page) -->
    <Teleport to="body" v-if="props.page == 'combinations'">
      <div class="md:hidden fixed bottom-6 right-6 z-40">
        <UButton
          icon="i-lucide-arrow-left"
          color="secondary"
          size="lg"
          class="rounded-full shadow-lg w-12 h-12 justify-center p-0"
          aria-label="Back to search"
          @click="backToSearch()"
        />
      </div>
    </Teleport>

    <div class="hidden md:flex flex-col gap-4 w-fit" v-if="props.page == 'search'">
      <UPopover arrow :content="{ side: 'top' }">
        <UButton
          label="Reset Selections"
          color="error"
          class="mt-8 w-fit"
          icon="i-lucide-refresh-ccw"
          variant="solid"
          size="xs"
          :disabled="selectedCoursesCount === 0"
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
                  clearCourses();
                  close();
                "
              />
            </div>
          </div>
        </template>
      </UPopover>
      <UTooltip
        :text="
          selectedCoursesCount == 0
            ? 'Select courses to view combinations'
            : totalCombinations == 0
            ? 'No valid combinations available for the selected courses'
            : 'View possible course combinations'
        "
      >
        <UButton
          label="View Schedules"
          trailing-icon="i-lucide-arrow-right"
          :disabled="selectedCoursesCount == 0 || totalCombinations == 0"
          to="/combinations"
        />
      </UTooltip>
    </div>

    <!-- Mobile floating action buttons (search page only) -->
    <Teleport to="body" v-if="props.page == 'search'">
      <div
        v-if="selectedCoursesCount > 0"
        class="md:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2"
      >
        <UPopover arrow :content="{ side: 'top' }">
          <UButton
            icon="i-lucide-refresh-ccw"
            color="error"
            variant="solid"
            size="lg"
            class="rounded-full shadow-lg w-12 h-12 justify-center p-0"
            aria-label="Reset selections"
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
                    clearCourses();
                    close();
                  "
                />
              </div>
            </div>
          </template>
        </UPopover>
        <UButton
          icon="i-lucide-arrow-right"
          size="lg"
          class="rounded-full shadow-lg w-12 h-12 justify-center p-0"
          :disabled="totalCombinations == 0"
          to="/combinations"
          aria-label="View schedules"
        />
      </div>
    </Teleport>

    <div v-if="props.page == 'combinations'" class="flex flex-col gap-6 md:gap-8 w-full md:w-fit md:max-w-sm">
      <div class="flex flex-col gap-4 w-fit"></div>
      <div
        v-for="course in courseManager.courses"
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
            @click="handleRemoveCourse(course._id)"
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
/* Styles handled in SearchLayout.vue */
</style>
