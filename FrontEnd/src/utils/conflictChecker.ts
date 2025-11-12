import { strToTime, strToDate, organizeTime } from "./timeUtils";

type SectionData = {
  [key: string]: string[][];
};

/**
 * Checks if two time ranges conflict
 */
function checkTimeConflictByPairs(
  course1Pair: string[],
  course2Pair: string[]
): boolean {
  const course1StartTime = strToTime(course1Pair[0]);
  const course1EndTime = strToTime(course1Pair[1]);
  const course2StartTime = strToTime(course2Pair[0]);
  const course2EndTime = strToTime(course2Pair[1]);
  if (
    (course1StartTime <= course2StartTime &&
      course2StartTime < course1EndTime) ||
    (course2StartTime <= course1StartTime &&
      course1StartTime < course2EndTime)
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if two courses have time conflicts
 */
function checkForTimeConflict(course1Time: string[], course2Time: string[]): boolean {
  const course1TimeOrganized = organizeTime(course1Time);
  const course2TimeOrganized = organizeTime(course2Time);
  for (let i = 0; i < course1TimeOrganized.length; i++) {
    for (let j = 0; j < course2TimeOrganized.length; j++) {
      if (
        checkTimeConflictByPairs(
          course1TimeOrganized[i],
          course2TimeOrganized[j]
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if two date ranges overlap
 */
function checkForDateConflict(course1Date: string[], course2Date: string[]): boolean {
  const course1StartDate = strToDate(course1Date[0]);
  const course1EndDate = strToDate(course1Date[1]);
  const course2StartDate = strToDate(course2Date[0]);
  const course2EndDate = strToDate(course2Date[1]);
  if (
    (course1StartDate <= course2StartDate &&
      course2StartDate <= course1EndDate) ||
    (course1StartDate <= course2EndDate && course2EndDate <= course1EndDate)
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if two course sections conflict on a specific day
 */
function checkForDayConflict(course1Day: string[][], course2Day: string[][]): boolean {
  const course1Date = course1Day[1];
  const course1Time = course1Day[0];
  const course2Date = course2Day[1];
  const course2Time = course2Day[0];

  const dateConflict = checkForDateConflict(course1Date, course2Date);
  const timeConflict = checkForTimeConflict(course1Time, course2Time);
  if (dateConflict && timeConflict) {
    return true;
  }
  return false;
}

/**
 * Checks if two course sections have any scheduling conflicts
 */
export function checkForConflict(
  course1Data: SectionData,
  course2Data: SectionData
): boolean {
  let sameDays = [];
  for (let day of Object.keys(course1Data)) {
    if (course2Data?.hasOwnProperty(day)) {
      sameDays.push(day);
    }
  }
  if (sameDays.length === 0) {
    return false;
  }
  for (let day of sameDays) {
    const course1Day = course1Data[day];
    const course2Day = course2Data[day];
    const conflict = checkForDayConflict(course1Day, course2Day);
    if (conflict) {
      return true;
    }
  }

  return false;
}
