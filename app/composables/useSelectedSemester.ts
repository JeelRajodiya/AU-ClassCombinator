import { useState } from "#app";
export default function useSelectedSemester() {
  // it will set the semester to whatever is passed
  const selectedSem = useState<string>("semester", () => {
    return "Fall 2023";
  });
  function setSelectedSem(sem: string) {
    selectedSem.value = sem;
  }
  return {
    selectedSem,
    setSelectedSem,
  };
}
