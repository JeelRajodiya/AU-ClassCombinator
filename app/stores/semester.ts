import { defineStore } from "pinia";

export const useSemesterStore = defineStore("semester", () => {
  const selectedSemester = ref<string>("Winter 2026");

  const setSelectedSemester = (semester: string) => {
    selectedSemester.value = semester;
  };

  return {
    selectedSemester,
    setSelectedSemester,
  };
});
