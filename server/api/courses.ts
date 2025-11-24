import { defineEventHandler, readBody, createError } from "h3";
import dbConnect from "../db";
import Course from "../models/Course";
import type { ICourseDTO } from "../../types/course";
import {
  handleApiError,
  COURSE_PROJECTION_WITHOUT_BITMASK,
} from "../utils/apiHelpers";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Body must be an array of course IDs",
    });
  }

  return handleApiError(async () => {
    await dbConnect();
    return (await Course.find({
      _id: { $in: body },
    })
      .select(COURSE_PROJECTION_WITHOUT_BITMASK)
      .lean()
      .exec()) as unknown as ICourseDTO[];
  }, "Error fetching courses:");
});
