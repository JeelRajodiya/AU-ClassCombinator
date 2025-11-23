import type { Document, ObjectId } from "mongoose";
import { Binary } from "mongodb";

export type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export interface ISlot {
  day: Day;
  startTime: string;
  endTime: string;
}

export type ISlotDTO = ISlot;

export interface IDateRange {
  start: Date;
  end: Date;
  oneDayBitMask: Binary;
}

export type IDateRangeDTO = Omit<IDateRange, "oneDayBitMask">;

export interface ISection {
  sectionId: string;
  quarter?: string | null;
  fiveMinuteBitMask: Binary;
  dateRange: IDateRange;
  slots: ISlot[];
}

export type ISectionDTO = Omit<ISection, "dateRange" | "fiveMinuteBitMask"> & {
  dateRange: IDateRangeDTO;
  slots: ISlotDTO[];
};

export interface ICourseCore {
  code: string;
  name: string;
  level: string;
  credits: number;
  faculties: string[];
  semester: string;
  year: number;
  prerequisite: string;
  antirequisite: string;
  description: string;
  gerCategory?: string | null;
  sections: ISection[];
}

export interface ICourse extends ICourseCore, Document<ObjectId> {}

export type ICourseDTO = Omit<ICourseCore, "sections"> & {
  _id: string;
  sections: ISectionDTO[];
};
