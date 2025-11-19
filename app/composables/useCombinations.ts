import type { AssignmentType } from "../../utils/combinator";
import { useState } from "#app";
export default function useCombinations() {
  // it will set the semester to whatever is passed
  const combinations = useState<AssignmentType[]>(() => {
    return [];
  });
  function setCombinations(newCombinations: AssignmentType[]) {
    combinations.value = newCombinations;
  }
  return {
    combinations,
    setCombinations,
  };
}
