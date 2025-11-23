import mongoose, { Schema } from "mongoose";
import type { ISlot, IDateRange, ISection, ICourse } from "../../types/course";

const SlotSchema = new Schema<ISlot>({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const DateRangeSchema = new Schema<IDateRange>({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  oneDayBitMask: { type: Schema.Types.Buffer, required: true },
});

const SectionSchema = new Schema<ISection>({
  sectionId: { type: String, required: true },
  quarter: { type: String, default: null },
  fiveMinuteBitMask: { type: Schema.Types.Buffer, required: true },
  dateRange: { type: DateRangeSchema, required: true },
  slots: { type: [SlotSchema], required: true },
});

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
export default mongoose.models.Course ||
  mongoose.model<ICourse>("Course", CourseSchema);
