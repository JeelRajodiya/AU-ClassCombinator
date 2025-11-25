import { defineStore } from "pinia";
import type { AssignmentType } from "~~/types/combinator";
import type { ICourseDTO } from "~~/types/course";

export const useCourseSelectionStore = defineStore("courseSelection", () => {
  // ==================== STATE ====================
  const selectedCourseIds = ref<string[]>([]);
  const selectedCourseDetails = ref<ICourseDTO[]>([]);
  const selectedSections = ref<Map<string, Set<string>>>(new Map());
  const combinations = ref<AssignmentType[]>([]);
  const allCombinations = ref<AssignmentType[]>([]);

  // Loading states
  const detailsLoading = ref(false);
  const combinationsLoading = ref(false);

  // ==================== GETTERS ====================
  const totalCredits = computed(() =>
    selectedCourseDetails.value.reduce((sum, course) => sum + course.credits, 0)
  );

  const totalCombinations = computed(() => combinations.value.length);

  const selectedCoursesCount = computed(() => selectedCourseIds.value.length);

  const hasValidCombinations = computed(
    () => selectedCoursesCount.value > 0 && totalCombinations.value > 0
  );

  // ==================== ACTIONS: Course Selection ====================
  const addCourse = (id: string) => {
    if (!selectedCourseIds.value.includes(id)) {
      selectedCourseIds.value.push(id);
    }
  };

  const removeCourse = (id: string) => {
    const index = selectedCourseIds.value.indexOf(id);
    if (index > -1) {
      selectedCourseIds.value.splice(index, 1);
      // Also remove from details
      selectedCourseDetails.value = selectedCourseDetails.value.filter(
        (c) => c._id !== id
      );
      // Clear section selections for this course
      clearCourseSection(id);
    }
  };

  const toggleCourse = (id: string) => {
    if (selectedCourseIds.value.includes(id)) {
      removeCourse(id);
    } else {
      addCourse(id);
    }
  };

  const clearCourses = () => {
    selectedCourseIds.value = [];
    selectedCourseDetails.value = [];
    selectedSections.value.clear();
    combinations.value = [];
    allCombinations.value = [];
  };

  const isSelected = (id: string) => {
    return selectedCourseIds.value.includes(id);
  };

  // Add course with details (for immediate UI feedback)
  const addCourseWithDetails = (course: ICourseDTO) => {
    if (!selectedCourseIds.value.includes(course._id)) {
      selectedCourseIds.value.push(course._id);
      if (!selectedCourseDetails.value.some((c) => c._id === course._id)) {
        selectedCourseDetails.value.push(course);
      }
    }
  };

  const toggleCourseWithDetails = (course: ICourseDTO) => {
    if (isSelected(course._id)) {
      removeCourse(course._id);
    } else {
      addCourseWithDetails(course);
    }
  };

  // ==================== ACTIONS: Section Selection ====================
  const initializeCourseSection = (
    courseId: string,
    allSectionIds: string[]
  ) => {
    if (!selectedSections.value.has(courseId)) {
      // By default, all sections are selected
      selectedSections.value.set(courseId, new Set(allSectionIds));
    }
  };

  const setSelectedSections = (courseId: string, sectionIds: string[]) => {
    selectedSections.value.set(courseId, new Set(sectionIds));
  };

  const getSelectedSections = (courseId: string): string[] => {
    return Array.from(selectedSections.value.get(courseId) || []);
  };

  const toggleSection = (courseId: string, sectionId: string) => {
    const sections = selectedSections.value.get(courseId);
    if (sections) {
      if (sections.has(sectionId)) {
        sections.delete(sectionId);
      } else {
        sections.add(sectionId);
      }
    }
  };

  const clearCourseSection = (courseId: string) => {
    selectedSections.value.delete(courseId);
  };

  const clearAllSections = () => {
    selectedSections.value.clear();
  };

  // ==================== ACTIONS: Combinations ====================
  const setCombinations = (newCombinations: AssignmentType[]) => {
    combinations.value = newCombinations;
    allCombinations.value = newCombinations;
  };

  const filterCombinationsBySections = () => {
    if (selectedSections.value.size === 0) {
      combinations.value = allCombinations.value;
      return;
    }

    combinations.value = allCombinations.value.filter((combination) => {
      // Check if all sections in this combination are selected
      for (const [courseId, sectionId] of Object.entries(combination)) {
        const selectedSectionsSet = selectedSections.value.get(courseId);
        if (selectedSectionsSet && !selectedSectionsSet.has(sectionId)) {
          return false;
        }
      }
      return true;
    });
  };

  // ==================== ACTIONS: Async Operations ====================
  const fetchSelectedDetails = async () => {
    if (selectedCourseIds.value.length === 0) {
      selectedCourseDetails.value = [];
      return;
    }
    detailsLoading.value = true;
    try {
      const courses = await $fetch<ICourseDTO[]>("/api/courses", {
        method: "POST",
        body: selectedCourseIds.value,
      });
      selectedCourseDetails.value = courses;
    } catch (error) {
      console.error("Error fetching selected course details:", error);
    } finally {
      detailsLoading.value = false;
    }
  };

  const fetchCombinations = async () => {
    if (selectedCourseIds.value.length === 0) {
      setCombinations([]);
      return;
    }

    combinationsLoading.value = true;
    try {
      const response = await $fetch<AssignmentType[]>("/api/combinations", {
        method: "POST",
        body: { ids: selectedCourseIds.value },
      });
      setCombinations(response);
    } catch (error) {
      console.error("Error fetching combinations:", error);
      setCombinations([]);
    } finally {
      combinationsLoading.value = false;
    }
  };

  return {
    // State
    selectedCourseIds,
    selectedCourseDetails,
    selectedSections,
    combinations,
    allCombinations,
    detailsLoading,
    combinationsLoading,

    // Getters
    totalCredits,
    totalCombinations,
    selectedCoursesCount,
    hasValidCombinations,

    // Actions: Course Selection
    addCourse,
    removeCourse,
    toggleCourse,
    clearCourses,
    isSelected,
    addCourseWithDetails,
    toggleCourseWithDetails,

    // Actions: Section Selection
    initializeCourseSection,
    setSelectedSections,
    getSelectedSections,
    toggleSection,
    clearCourseSection,
    clearAllSections,

    // Actions: Combinations
    setCombinations,
    filterCombinationsBySections,

    // Actions: Async
    fetchSelectedDetails,
    fetchCombinations,
  };
});
