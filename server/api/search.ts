import Course, { type ICourseDTO } from "../models/Course";

interface ISearchParams {
  searchQuery?: string;
  year: number;
  semester: string;
  page?: number;
  maxResults?: number;
}
const MAX_RESULTS_DEFAULT = 5;
export const searchCourses = async ({
  searchQuery,
  year,
  semester,
  page = 1,
  maxResults = MAX_RESULTS_DEFAULT,
}: ISearchParams): Promise<ICourseDTO[]> => {
  try {
    // Define the base filter with the required fixed fields.
    // We use 'any' here to dynamically build the query object.
    const filter: any = {
      year: year,
      semester: semester,
    };

    // If a search query is provided, add the fuzzy search conditions.
    if (searchQuery && searchQuery.trim() !== "") {
      // Escape special regex characters in the user's search query
      // This prevents errors if the query contains characters like
      const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Create a new case-insensitive regular expression
      const regex = new RegExp(escapedQuery, "i");

      // Add the $or condition. This finds documents where *at least one*
      // of the fields in the array matches the regex.
      filter.$or = [
        { code: regex },
        { name: regex },
        { faculties: regex }, // Mongoose handles applying the regex to each element in the array.
      ];
    }

    // Execute the query using the constructed filter
    const courses = (await Course.find(filter)
      .skip((page - 1) * maxResults)
      .limit(maxResults)
      .lean()
      .exec()) as unknown as ICourseDTO[];

    return courses;
  } catch (error) {
    console.error("Error searching courses:", error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const searchTerm = query.q as string;
  const selectedSemester = query.semester as string;
  const page = parseInt(query.page as string) || 1;
  const maxResults =
    parseInt(query.maxResults as string) || MAX_RESULTS_DEFAULT;

  if (!searchTerm || !selectedSemester) {
    // invalid request, return error code
    event.node.res.statusCode = 400;
    return { error: "Missing search term or semester" };
  }
  const [semester, yearStr] = selectedSemester.split(" ");
  const year = parseInt(yearStr, 10);
  if (!semester || isNaN(year)) {
    // invalid semester format
    event.node.res.statusCode = 400;
    return {
      error: "Invalid semester format, it must be in 'Semester Year' format",
    };
  }

  const results = await searchCourses({
    searchQuery: searchTerm,
    year,
    semester,
    page,
    maxResults,
  });

  return results;
});
