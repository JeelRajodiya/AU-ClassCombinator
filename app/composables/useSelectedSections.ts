export const useSelectedSections = () => {
  // Map of courseId -> Set of selected sectionIds (composite format: courseId.sectionNo)
  const selectedSections = useState<Map<string, Set<string>>>(
    "selectedSections",
    () => new Map()
  );

  const initializeCourse = (courseId: string, allSectionIds: string[]) => {
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

  const clearCourse = (courseId: string) => {
    selectedSections.value.delete(courseId);
  };

  const clearAll = () => {
    selectedSections.value.clear();
  };

  return {
    selectedSections,
    initializeCourse,
    setSelectedSections,
    getSelectedSections,
    toggleSection,
    clearCourse,
    clearAll,
  };
};
