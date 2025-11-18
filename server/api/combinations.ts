import dbConnect from "../db";
import Course from "../models/Course";
import Combinator from "../../utils/combinator";

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
    // const ids = [
    //   "691c3d8abd3441973ad038ff",
    //   "691c3d8abd3441973ad03901",
    //   "691c3d8abd3441973ad03904",
    //   // "691c3d8abd3441973ad0390b",
    // ];
    const c = new Combinator();
    console.time("generateCombinations");
    const result = await c.generate(courseCodes);
    console.timeEnd("generateCombinations");
    return result;
  } catch (error) {
    console.error("Error generating combinations:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
