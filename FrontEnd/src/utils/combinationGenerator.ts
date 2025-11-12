/**
 * Generates all possible combinations from an array of arrays
 * @param arr Array of string arrays where each sub-array represents options for one position
 * @param n Number of elements to combine
 * @returns Array of all possible combinations
 */
export function getNumberCombinations(arr: string[][], n: number): string[][] {
  let i: number,
    j: number,
    k: number,
    elem: string[] | undefined,
    l = arr.length,
    childperm: string[][],
    ret: string[][] = [];
  if (n == 1) {
    for (i = 0; i < arr.length; i++) {
      for (j = 0; j < arr[i].length; j++) {
        ret.push([arr[i][j]]);
      }
    }
    return ret;
  } else {
    for (i = 0; i < l; i++) {
      elem = arr.shift();
      for (j = 0; j < elem!.length; j++) {
        childperm = getNumberCombinations(arr.slice(), n - 1);
        for (k = 0; k < childperm.length; k++) {
          ret.push([elem![j]].concat(childperm[k]));
        }
      }
    }
    return ret;
  }
}
