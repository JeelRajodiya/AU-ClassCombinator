import type { AssignmentType } from "../../utils/combinator";
import { useState } from "#app";
export default function useCombinations() {
  // it will set the semester to whatever is passed
  const combinations = useState<AssignmentType[]>(() => {
    return [];
  });

  const allCombinations = useState<AssignmentType[]>(() => {
    return [];
  });

  function setCombinations(newCombinations: AssignmentType[]) {
    combinations.value = newCombinations;
    allCombinations.value = newCombinations;
  }

  function filterCombinationsBySections(
    selectedSectionsMap: Map<string, Set<string>>
  ) {
    if (selectedSectionsMap.size === 0) {
      combinations.value = allCombinations.value;
      return;
    }

    combinations.value = allCombinations.value.filter((combination) => {
      // Check if all sections in this combination are selected
      for (const [courseId, sectionId] of Object.entries(combination)) {
        const selectedSections = selectedSectionsMap.get(courseId);
        if (selectedSections && !selectedSections.has(sectionId)) {
          return false;
        }
      }
      return true;
    });
  }

  return {
    combinations,
    allCombinations,
    setCombinations,
    filterCombinationsBySections,
  };
}
