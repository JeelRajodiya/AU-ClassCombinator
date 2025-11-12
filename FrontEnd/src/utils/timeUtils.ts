import { trimStart } from "lodash";

/**
 * Converts a time string (HH:MM) to minutes since midnight
 */
export function strToTime(str: string): number {
  const time = str.split(":");
  const hour = parseInt(time[0]);
  const min = parseInt(time[1]);
  return hour * 60 + min;
}

/**
 * Converts a date string (DD-MM-YYYY) to a Date object
 */
export function strToDate(str: string): Date {
  const date = str.split("-");
  const day = parseInt(date[0]);
  const month = parseInt(trimStart(date[1], "0"));
  const year = parseInt(date[2]);
  return new Date(year, month, day);
}

/**
 * Organizes time array into pairs and merges consecutive time slots
 * Example: ["13:00", "14:30", "14:30", "16:00"] => [["13:00", "16:00"]]
 */
export function organizeTime(time: string[]): string[][] {
  let organizedTime: string[][] = [];
  for (let i = 0; i < time.length; i += 2) {
    organizedTime.push([time[i], time[i + 1]]);
  }
  // Convert consecutive time slots into single ranges
  for (let i = 0; i < organizedTime.length - 1; i++) {
    if (organizedTime[i][1] === organizedTime[i + 1][0]) {
      organizedTime[i][1] = organizedTime[i + 1][1];
      organizedTime.splice(i + 1, 1);
      i--;
    }
  }
  // Remove duplicate time pairs
  let organizedTime2: string[][] = [];
  for (let i = 0; i < organizedTime.length; i++) {
    if (!organizedTime2.includes(organizedTime[i])) {
      organizedTime2.push(organizedTime[i]);
    }
  }

  return organizedTime2;
}

/**
 * Converts string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

/**
 * Sorts weekday names in chronological order
 */
export function sortWeekdays(weekdays: string[]): string[] {
  const daysInOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  weekdays.sort((a, b) => daysInOrder.indexOf(a) - daysInOrder.indexOf(b));
  return weekdays;
}
