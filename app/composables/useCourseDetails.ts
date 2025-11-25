import type { ICourseDTO } from "~~/types/course";
import { useCourseSelectionStore } from "~/stores/courseSelection";

export function useCourseDetails(selectedIds: Ref<string[]>) {
  const courseStore = useCourseSelectionStore();
  const loading = ref(false);

  // We use the store's selectedCourseDetails as the source of truth
  // so that other components (like SearchStats) stay in sync.
  const details = computed(() => courseStore.selectedCourseDetails);

  const fetchDetails = async () => {
    if (selectedIds.value.length === 0) {
      courseStore.selectedCourseDetails = [];
      return;
    }

    loading.value = true;
    try {
      const courses = await $fetch<ICourseDTO[]>("/api/courses", {
        method: "POST",
        body: selectedIds.value,
      });
      courseStore.selectedCourseDetails = courses;
    } catch (error) {
      console.error("Error fetching selected course details:", error);
    } finally {
      loading.value = false;
    }
  };

  // Watch for changes in selectedIds to re-fetch?
  // The user's prompt didn't explicitly ask for a watcher inside the composable,
  // but search.vue had a watcher.
  // "Extract into separate composables... useCourseDetails(selectedIds: Ref<string[]>)"
  // Usually composables might set up watchers.
  // However, search.vue only fetched when activeTab changed or onMounted.
  // But it also had:
  /*
    // Watch selectedCourseIds to fetch combinations
    watch(
      () => courseStore.selectedCourseIds,
      async () => {
        await courseStore.fetchCombinations();
      },
      { deep: true }
    );
  */
  // It didn't seem to watch selectedIds to fetch *details* automatically,
  // except maybe implicitly?
  // Actually, search.vue:
  /*
    // Watch activeTab to fetch details when switching to "selected"
    watch(activeTab, (newTab) => {
      if (newTab === "selected") {
        courseStore.fetchSelectedDetails();
      }
    });
  */
  // It seems it only fetches when tab is selected.
  // So I won't add an automatic watcher for fetchDetails here,
  // I'll let the component call it.

  return {
    details,
    loading,
    fetchDetails,
  };
}
