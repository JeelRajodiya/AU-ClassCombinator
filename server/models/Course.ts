import mongoose, { Schema, Document } from "mongoose";

// Interface for Slot
export interface ISlot {
  day: string;
  startTime: string;
  endTime: string;
  fiveMinuteBitMask: Buffer;
}

// Interface for Slot DTO (without bitmask)
export interface ISlotDTO {
  day: string;
  startTime: string;
  endTime: string;
}

// Schema for Slot
const SlotSchema = new Schema<ISlot>({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  fiveMinuteBitMask: { type: Buffer, required: true },
});

// Interface for DateRange
export interface IDateRange {
  start: Date;
  end: Date;
  oneDayBitMask: Buffer;
}

// Interface for DateRange DTO (without bitmask)
export interface IDateRangeDTO {
  start: Date;
  end: Date;
}

// Schema for DateRange
const DateRangeSchema = new Schema<IDateRange>({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  oneDayBitMask: { type: Buffer, required: true },
});

// Interface for Section
export interface ISection {
  sectionId: string;
  quarter?: string | null;
  dateRange: IDateRange;
  slots: ISlot[];
}

// Interface for Section DTO (without bitmasks)
export interface ISectionDTO {
  sectionId: string;
  quarter?: string | null;
  dateRange: IDateRangeDTO;
  slots: ISlotDTO[];
}

// Schema for Section
const SectionSchema = new Schema<ISection>({
  sectionId: { type: String, required: true },
  quarter: { type: String, default: null },
  dateRange: { type: DateRangeSchema, required: true },
  slots: { type: [SlotSchema], required: true },
});

// Shape common to both plain objects and mongoose documents
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

// Interface for Course Document (used by Mongoose)
export interface ICourse extends ICourseCore, Document {}

// Plain object returned via APIs / frontend consumption (without bitmasks)
export type ICourseDTO = Omit<ICourseCore, "sections"> & {
  _id: string;
  sections: ISectionDTO[];
};

// Schema for Course
const CourseSchema = new Schema<ICourse>({
  code: { type: String, required: true },
  name: { type: String, required: true },
  level: { type: String, required: true },
  credits: { type: Number, required: true },
  faculties: { type: [String], required: true },
  semester: { type: String, required: true },
  year: { type: Number, required: true },
  prerequisite: { type: String, required: true },
  antirequisite: { type: String, required: true },
  description: { type: String, required: true },
  gerCategory: { type: String, default: null },
  sections: { type: [SectionSchema], required: true },
});

// Export the model
export default mongoose.model<ICourse>("Course", CourseSchema);
