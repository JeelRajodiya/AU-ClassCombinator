import { createError } from "h3";

/**
 * Wraps an async operation with error handling.
 * Logs the error and throws a standardized API error.
 * @param operation - The async operation to execute
 * @param errorMessage - The error message to log
 * @returns The result of the operation
 */
export async function handleApiError<T>(
  operation: () => Promise<T>,
  errorMessage: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
}

/**
 * Common projection string to exclude bit mask fields from Course queries.
 * This reduces the response payload size for API endpoints.
 */
export const COURSE_PROJECTION_WITHOUT_BITMASK =
  "-sections.fiveMinuteBitMask -sections.dateRange.oneDayBitMask";
