import mongoose, { Schema, Document } from "mongoose";

// Interface for Slot
export interface ISlot {
  day: string;
  startTime: string;
  endTime: string;
}

// Schema for Slot
const SlotSchema = new Schema<ISlot>({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

// Interface for DateRange
export interface IDateRange {
  start: Date;
  end: Date;
}

// Schema for DateRange
const DateRangeSchema = new Schema<IDateRange>({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

// Interface for Section
export interface ISection {
  sectionId: string;
  quarter?: string | null;
  dateRange: IDateRange;
  slots: ISlot[];
}

// Schema for Section
const SectionSchema = new Schema<ISection>({
  sectionId: { type: String, required: true },
  quarter: { type: String, default: null },
  dateRange: { type: DateRangeSchema, required: true },
  slots: { type: [SlotSchema], required: true },
});

// Interface for Course
export interface ICourse extends Document {
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
