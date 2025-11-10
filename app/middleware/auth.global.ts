export default defineNuxtRouteMiddleware(async (to) => {
  // Always allow access to the login page
  if (to.path === "/login") {
    const { status, data } = useAuth();

    // Redirect authenticated users away from login
    if (status.value === "authenticated") {
      return navigateTo("/");
    }
    return;
  }

  // For all other pages, require authentication
  const { status } = useAuth();
  if (status.value !== "authenticated") {
    return navigateTo("/login");
  }
});
