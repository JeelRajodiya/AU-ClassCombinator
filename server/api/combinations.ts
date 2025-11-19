import Combinator from "../../utils/combinator";
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

  try {
    const c = new Combinator();
    const result = await c.generate(courseIds);
    return result;
  } catch (error) {
    console.error("Error generating combinations:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
