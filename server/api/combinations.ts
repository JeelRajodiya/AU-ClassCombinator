import dbConnect from "../db";
import Course from "../models/Course";

export default defineEventHandler(async (event) => {
  // the user will send list of course codes, I'll generate combinations for them
  // post method

  const body = await readBody(event);
  console.log("Request body:", body);
  if (!body.courseCodes || !Array.isArray(body.courseCodes)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body: 'courseCodes' array is required.",
    });
  }

  const courseCodes: string[] = body.courseCodes;

  try {
    await dbConnect();

    // Fetch course details for the provided course codes
    const courses = await Course.find({ code: { $in: courseCodes } })
      .lean()
      .exec();

    if (courses.length === 0) {
      return { combinations: [] };
    }

    // Generate combinations logic goes here
    // For simplicity, let's assume we just return the fetched courses as a single combination
    const combinations = [courses];

    return { combinations };
  } catch (error) {
    console.error("Error generating combinations:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
