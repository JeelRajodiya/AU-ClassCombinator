import { defineEventHandler, readBody, createError } from "h3";
import Combinator from "../utils/combinator";
import { handleApiError } from "../utils/apiHelpers";

export default defineEventHandler(async (event) => {
  // the user will send list of course ids, I'll generate combinations for them
  // post method

  const body = await readBody(event);
  if (!body.ids || !Array.isArray(body.ids)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid request body: 'ids' array is required.",
    });
  }

  const courseIds: string[] = body.ids;

  return handleApiError(async () => {
    const c = new Combinator();
    return await c.generate(courseIds);
  }, "Error generating combinations:");
});
