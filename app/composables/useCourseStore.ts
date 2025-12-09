import { useState, computed } from "#imports";
import type { ICourseDTO } from "~~/types/course";
import type { AssignmentType } from "~~/types/combinator";
import CourseManager from "~~/utils/courseManager";

/**
 * Centralized store for all course-related state.
 * Consolidates useSelectedCourses, useSelectedSections, useCombinations, and useSelectedSemester.
 */
export const useCourseStore = () => {
  // ============== STATE ==============

  // Semester
  const selectedSemester = useState<string>(
    "store:semester",
    () => "Winter 2026"
  );

  // Selected course IDs
  const selectedCourseIds = useState<string[]>(
    "store:selectedCourseIds",
    () => []
  );

  // Full course details (fetched from API)
  const selectedCourseDetails = useState<ICourseDTO[]>(
    "store:selectedCourseDetails",
    () => []
  );

  // Section selections: Map of courseId -> Set of selected sectionIds
  const selectedSections = useState<Map<string, Set<string>>>(
    "store:selectedSections",
    () => new Map()
  );

  // Combinations
  const combinations = useState<AssignmentType[]>(
    "store:combinations",
    () => []
  );
  const allCombinations = useState<AssignmentType[]>(
    "store:allCombinations",
    () => []
  );

  // Loading states
  const detailsLoading = useState<boolean>("store:detailsLoading", () => false);
  const combinationsLoading = useState<boolean>(
    "store:combinationsLoading",
    () => false
  );

  // ============== COMPUTED ==============

  const courseManager = computed(() => {
    return new CourseManager(selectedCourseDetails.value);
  });

  const totalCredits = computed(() => {
    return selectedCourseDetails.value.reduce(
      (sum, course) => sum + course.credits,
      0
    );
  });

  const totalCombinations = computed(() => combinations.value.length);

  const selectedCoursesCount = computed(() => selectedCourseIds.value.length);

  // ============== SEMESTER ACTIONS ==============

  const setSelectedSemester = (sem: string) => {
    selectedSemester.value = sem;
  };

  // ============== COURSE SELECTION ACTIONS ==============

  const isSelected = (id: string) => {
    return selectedCourseIds.value.includes(id);
  };

  const addCourse = (course: ICourseDTO) => {
    if (!selectedCourseIds.value.includes(course._id)) {
      selectedCourseIds.value.push(course._id);
      // Add to details if not already present
      if (!selectedCourseDetails.value.some((c) => c._id === course._id)) {
        selectedCourseDetails.value.push(course);
      }
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
      selectedSections.value.delete(id);
    }
  };

  const toggleCourse = (course: ICourseDTO) => {
    if (isSelected(course._id)) {
      removeCourse(course._id);
    } else {
      addCourse(course);
    }
  };

  const clearCourses = () => {
    selectedCourseIds.value = [];
    selectedCourseDetails.value = [];
    selectedSections.value.clear();
    combinations.value = [];
    allCombinations.value = [];
  };

  // ============== SECTION SELECTION ACTIONS ==============

  const initializeCourse = (courseId: string, allSectionIds: string[]) => {
    if (!selectedSections.value.has(courseId)) {
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

  // ============== COMBINATIONS ACTIONS ==============

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
      for (const [courseId, sectionId] of Object.entries(combination)) {
        const sectionsSet = selectedSections.value.get(courseId);
        if (sectionsSet && !sectionsSet.has(sectionId)) {
          return false;
        }
      }
      return true;
    });
  };

  // ============== API ACTIONS ==============

  const fetchCourseDetails = async () => {
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
      console.error("Error fetching course details:", error);
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
    selectedSemester,
    selectedCourseIds,
    selectedCourseDetails,
    selectedSections,
    combinations,
    allCombinations,
    detailsLoading,
    combinationsLoading,

    // Computed
    courseManager,
    totalCredits,
    totalCombinations,
    selectedCoursesCount,

    // Semester actions
    setSelectedSemester,

    // Course selection actions
    isSelected,
    addCourse,
    removeCourse,
    toggleCourse,
    clearCourses,

    // Section selection actions
    initializeCourse,
    setSelectedSections,
    getSelectedSections,
    toggleSection,

    // Combinations actions
    setCombinations,
    filterCombinationsBySections,

    // API actions
    fetchCourseDetails,
    fetchCombinations,
  };
};
