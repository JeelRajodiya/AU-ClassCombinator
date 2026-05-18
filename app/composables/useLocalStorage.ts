/**
 * Local storage utility for persisting course selections.
 * Data expires after 2 months from creation/update.
 */

interface StoredData<T> {
  value: T;
  expiry: number; // Timestamp when data expires
}

const STORAGE_KEYS = {
  SELECTED_COURSE_IDS: "courseDirectory:selectedCourseIds",
  SELECTED_SEMESTER: "courseDirectory:selectedSemester",
} as const;

const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000; // 60 days in milliseconds

/**
 * Get data from local storage, checking expiry.
 * Returns null if data doesn't exist or has expired.
 */
function getFromStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const stored: StoredData<T> = JSON.parse(item);

    // Check if expired
    if (Date.now() > stored.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return stored.value;
  } catch {
    // If parsing fails, remove corrupted data
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Save data to local storage with expiry of 2 months.
 */
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    const stored: StoredData<T> = {
      value,
      expiry: Date.now() + TWO_MONTHS_MS,
    };
    localStorage.setItem(key, JSON.stringify(stored));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
}

export const useLocalStorage = () => {
  /**
   * Get stored selected course IDs.
   * Returns null if not found or expired.
   */
  const getStoredCourseIds = (): string[] | null => {
    return getFromStorage<string[]>(STORAGE_KEYS.SELECTED_COURSE_IDS);
  };

  /**
   * Save selected course IDs to local storage.
   */
  const saveCourseIds = (ids: string[]): void => {
    saveToStorage(STORAGE_KEYS.SELECTED_COURSE_IDS, ids);
  };

  /**
   * Get stored selected semester.
   * Returns null if not found or expired.
   */
  const getStoredSemester = (): string | null => {
    return getFromStorage<string>(STORAGE_KEYS.SELECTED_SEMESTER);
  };

  /**
   * Save selected semester to local storage.
   */
  const saveSemester = (semester: string): void => {
    saveToStorage(STORAGE_KEYS.SELECTED_SEMESTER, semester);
  };

  /**
   * Clear all stored data.
   */
  const clearStorage = (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.SELECTED_COURSE_IDS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_SEMESTER);
  };

  return {
    getStoredCourseIds,
    saveCourseIds,
    getStoredSemester,
    saveSemester,
    clearStorage,
  };
};
