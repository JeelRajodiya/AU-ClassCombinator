import { defineEventHandler } from "h3";
import dbConnect from "../db";
import Course from "../models/Course";
import { handleApiError } from "../utils/apiHelpers";

async function getUniqueSemesters() {
  await dbConnect();
  const pipeline = [
    {
      // 1. Group by the unique combination of semester and year
      $group: {
        _id: {
          semester: "$semester",
          year: "$year",
        },
      },
    },
    {
      // 2. (Optional) Sort the results.
      // This sorts by year descending (most recent first), then semester ascending
      $sort: {
        "_id.year": -1 as const,
        "_id.semester": 1 as const,
      },
    },
    {
      // 3. Format the output string
      $project: {
        _id: 0, // Hide the default _id
        // Create the "Semester Year" string
        semesterYear: {
          $concat: [
            "$_id.semester",
            " ",
            { $toString: "$_id.year" }, // Convert the number 'year' to a string
          ],
        },
      },
    },
  ];

  const results = await Course.aggregate(pipeline);

  // results will be:
  // [
  //   { semesterYear: "Winter 2025" },
  //   { semesterYear: "Monsoon 2025" },
  //   { semesterYear: "Winter 2024" }
  // ]

  // 4. Map the results to a simple array of strings
  const semesterList = results.map((item) => item.semesterYear);

  // Output: ["Winter 2025", "Monsoon 2025", "Winter 2024"]

  return semesterList;
}

export default defineEventHandler(async (event) => {
  return handleApiError(
    async () => await getUniqueSemesters(),
    "Error fetching unique semesters:"
  );
});
