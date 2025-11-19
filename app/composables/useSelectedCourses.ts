export const useSelectedCourses = () => {
  const selectedCourseIds = useState<string[]>("selectedCourseIds", () => []);

  const addCourse = (id: string) => {
    if (!selectedCourseIds.value.includes(id)) {
      selectedCourseIds.value.push(id);
    }
  };

  const removeCourse = (id: string) => {
    const index = selectedCourseIds.value.indexOf(id);
    if (index > -1) {
      selectedCourseIds.value.splice(index, 1);
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
  };

  const isSelected = (id: string) => {
    return selectedCourseIds.value.includes(id);
  };

  return {
    selectedCourseIds,
    addCourse,
    removeCourse,
    toggleCourse,
    clearCourses,
    isSelected,
  };
};
