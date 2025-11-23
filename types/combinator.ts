import type { Day } from "./course";

export type AssignmentType = { [courseId: string]: string };

export interface TimetableEvent {
  id: string | number;
  title: string;
  subtitle?: string;
  day: Day;
  startTime: string;
  endTime: string;
  color?: string;
}
