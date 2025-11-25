import type { ICourseDTO } from "~~/types/course";
import { useSemesterStore } from "~/stores/semester";

export function useSearch() {
  const route = useRoute();
  const router = useRouter();
  const semesterStore = useSemesterStore();

  const searchTerm = ref((route.query.q as string) || "");
  const searchResults = ref<ICourseDTO[]>([]);
  const loading = ref(false);

  // Set loading to true if there's an initial search term
  if (searchTerm.value.trim()) {
    loading.value = true;
  }

  const performSearch = async () => {
    if (!searchTerm.value.trim() || !semesterStore.selectedSemester) return;

    loading.value = true;
    searchResults.value = [];

    try {
      const results = await $fetch<ICourseDTO[]>("/api/search", {
        query: {
          q: searchTerm.value,
          semester: semesterStore.selectedSemester,
          page: 1,
        },
      });
      searchResults.value = results;
      // Update URL query parameters
      router.push({
        query: { q: searchTerm.value },
      });
    } catch (error) {
      console.error("Search error:", error);
      searchResults.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    searchTerm,
    searchResults,
    loading,
    performSearch,
  };
}
