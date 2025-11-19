import dbConnect from "../db";
import Course, { type ICourseDTO } from "../models/Course";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Body must be an array of course IDs",
    });
  }

  try {
    await dbConnect();
    const courses = (await Course.find({
      _id: { $in: body },
    })
      .select("-sections.fiveMinuteBitMask -sections.dateRange.oneDayBitMask")
      .lean()
      .exec()) as unknown as ICourseDTO[];

    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
