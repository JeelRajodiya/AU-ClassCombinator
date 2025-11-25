# Course Combinator V2 - Architecture Documentation

## Overview

Course Combinator is a Nuxt 3 (Vue.js) application that helps students at Ahmedabad University generate class timetables based on course selections. The app uses a composable-based state management pattern with MongoDB as the backend database.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT (Nuxt 3 / Vue 3)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│   ┌──────────────────────────────────────────────────────────────────────┐     │
│   │                            PAGES                                      │     │
│   │  ┌───────────┐  ┌───────────┐  ┌────────────────┐  ┌───────────┐     │     │
│   │  │ index.vue │  │ login.vue │  │   search.vue   │  │combinations│     │     │
│   │  │  (Home)   │  │  (Auth)   │  │ (Main Search)  │  │   .vue     │     │     │
│   │  └─────┬─────┘  └───────────┘  └───────┬────────┘  └─────┬─────┘     │     │
│   └────────┼────────────────────────────────┼────────────────┼───────────┘     │
│            │                                │                │                 │
│   ┌────────▼────────────────────────────────▼────────────────▼───────────┐     │
│   │                          COMPOSABLES (State)                          │     │
│   │  ┌──────────────────┐ ┌──────────────────┐ ┌───────────────────────┐ │     │
│   │  │useSelectedCourses│ │useSelectedSections│ │   useCombinations     │ │     │
│   │  │  selectedIds[]   │ │ Map<id, Set<>>   │ │ combinations[]        │ │     │
│   │  └──────────────────┘ └──────────────────┘ │ allCombinations[]     │ │     │
│   │                                             └───────────────────────┘ │     │
│   │  ┌───────────────────┐                                                │     │
│   │  │useSelectedSemester│                                                │     │
│   │  │  selectedSem      │                                                │     │
│   │  └───────────────────┘                                                │     │
│   └───────────────────────────────────────────────────────────────────────┘     │
│            │                                                                    │
│   ┌────────▼────────────────────────────────────────────────────────────┐      │
│   │                          COMPONENTS                                  │      │
│   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │      │
│   │  │SearchLayout │ │ SearchStats │ │ CourseCard  │ │ TimeTable   │   │      │
│   │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │      │
│   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │      │
│   │  │SearchField  │ │ ResultTabs  │ │SemesterSwitch│ │   Logo(s)   │  │      │
│   │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │      │
│   └─────────────────────────────────────────────────────────────────────┘      │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐      │
│   │                          UTILITIES                                   │      │
│   │  ┌─────────────────────────────────────────────────────────────┐    │      │
│   │  │ CourseManager - Helper class for course/section operations   │    │      │
│   │  └─────────────────────────────────────────────────────────────┘    │      │
│   └─────────────────────────────────────────────────────────────────────┘      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ HTTP (API Routes)
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SERVER (Nitro)                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────────────────────────┐      │
│   │                         API ENDPOINTS                                │      │
│   │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │      │
│   │  │ /api/search │ │/api/courses │ │/api/semesters│ │/api/         │  │      │
│   │  │   GET       │ │   POST      │ │    GET       │ │combinations  │  │      │
│   │  └─────────────┘ └─────────────┘ └─────────────┘ │   POST       │  │      │
│   │                                                   └─────────────┘   │      │
│   └─────────────────────────────────────────────────────────────────────┘      │
│                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────┐      │
│   │                        SERVER UTILITIES                              │      │
│   │  ┌──────────────────────────────────────────────────────────┐       │      │
│   │  │ Combinator - AC-3 + Backtracking algorithm for schedules │       │      │
│   │  └──────────────────────────────────────────────────────────┘       │      │
│   └─────────────────────────────────────────────────────────────────────┘      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ Mongoose
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE (MongoDB)                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│   ┌─────────────────────────────────────────────────────────────────────┐      │
│   │                          COLLECTIONS                                 │      │
│   │  ┌─────────────────────────┐  ┌─────────────────────────┐          │      │
│   │  │        courses          │  │         users           │          │      │
│   │  │  - code, name, level    │  │  - email, name          │          │      │
│   │  │  - credits, faculties   │  │  - image, emailVerified │          │      │
│   │  │  - semester, year       │  └─────────────────────────┘          │      │
│   │  │  - sections[]           │                                        │      │
│   │  │    - sectionId, slots[] │                                        │      │
│   │  │    - fiveMinuteBitMask  │                                        │      │
│   │  └─────────────────────────┘                                        │      │
│   └─────────────────────────────────────────────────────────────────────┘      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## State Management Architecture

The application uses **Nuxt's `useState` composable** for global state management. This provides reactive, SSR-safe state that persists across page navigation.

### State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            STATE DEFINITIONS                                    │
│                         (app/composables/*.ts)                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                     useSelectedCourses.ts                                  │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ STATE: selectedCourseIds: string[]                                   │  │ │
│  │  │                                                                      │  │ │
│  │  │ ACTIONS:                                                             │  │ │
│  │  │   • addCourse(id)      - Add course ID to selection                  │  │ │
│  │  │   • removeCourse(id)   - Remove course ID from selection             │  │ │
│  │  │   • toggleCourse(id)   - Toggle selection state                      │  │ │
│  │  │   • clearCourses()     - Clear all selections                        │  │ │
│  │  │   • isSelected(id)     - Check if course is selected                 │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                     useSelectedSections.ts                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ STATE: selectedSections: Map<string, Set<string>>                    │  │ │
│  │  │        (courseId -> Set of sectionIds)                               │  │ │
│  │  │                                                                      │  │ │
│  │  │ ACTIONS:                                                             │  │ │
│  │  │   • initializeCourse(courseId, sectionIds[])                         │  │ │
│  │  │   • setSelectedSections(courseId, sectionIds[])                      │  │ │
│  │  │   • getSelectedSections(courseId) -> string[]                        │  │ │
│  │  │   • toggleSection(courseId, sectionId)                               │  │ │
│  │  │   • clearCourse(courseId)                                            │  │ │
│  │  │   • clearAll()                                                       │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                       useCombinations.ts                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ STATE: combinations: AssignmentType[]      (filtered results)        │  │ │
│  │  │        allCombinations: AssignmentType[]   (all server results)      │  │ │
│  │  │                                                                      │  │ │
│  │  │ ACTIONS:                                                             │  │ │
│  │  │   • setCombinations(newCombinations[])                               │  │ │
│  │  │   • filterCombinationsBySections(selectedSectionsMap)                │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                     useSelectedSemester.ts                                 │ │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │ │
│  │  │ STATE: selectedSem: string (default: "Winter 2026")                  │  │ │
│  │  │                                                                      │  │ │
│  │  │ ACTIONS:                                                             │  │ │
│  │  │   • setSelectedSem(sem) - Update selected semester                   │  │ │
│  │  └─────────────────────────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component State Usage Matrix

| Component / Page           | useSelectedCourses | useSelectedSections | useCombinations | useSelectedSemester |
| -------------------------- | :----------------: | :-----------------: | :-------------: | :-----------------: |
| **pages/index.vue**        |         ❌         |         ❌          |       ❌        |         ✅          |
| **pages/search.vue**       |         ✅         |         ❌          |       ✅        |         ✅          |
| **pages/combinations.vue** |         ✅         |         ✅          |       ✅        |         ❌          |
| **SearchLayout.vue**       |         ❌         |         ❌          |       ❌        |         ❌          |
| **SearchStats.vue**        |         ✅         |         ✅          |       ✅        |         ❌          |
| **SearchField.vue**        |         ❌         |         ❌          |       ❌        |         ❌          |
| **SemesterSwitch.vue**     |         ❌         |         ❌          |       ❌        |         ✅          |
| **CourseCard.vue**         |         ❌         |         ❌          |       ❌        |         ❌          |
| **TimeTable.vue**          |         ❌         |         ❌          |       ❌        |         ❌          |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER JOURNEY                                       │
└─────────────────────────────────────────────────────────────────────────────────┘

   ┌──────────┐        ┌──────────────┐        ┌─────────────────┐
   │  Login   │───────▶│  Home Page   │───────▶│   Search Page   │
   │  Page    │        │  (index.vue) │        │  (search.vue)   │
   └──────────┘        └──────┬───────┘        └────────┬────────┘
                              │                         │
                              │                         │
                    ┌─────────▼─────────┐               │
                    │ Select Semester   │               │
                    │ (SemesterSwitch)  │               │
                    │                   │               │
                    │ useSelectedSemester               │
                    │ selectedSem ←────────────────────┐│
                    └───────────────────┘               ││
                                                       ▼│
                              ┌─────────────────────────┴┐
                              │                          │
                    ┌─────────▼─────────┐                │
                    │  Search Courses   │                │
                    │   $fetch(/api/search)              │
                    │   query: { q, semester }           │
                    └─────────┬─────────┘                │
                              │                          │
                              │ searchResults[]          │
                              ▼                          │
                    ┌───────────────────┐                │
                    │  Display Results  │                │
                    │  (CourseCard[])   │◀───────────────┘
                    └─────────┬─────────┘
                              │
                              │ User clicks to select
                              ▼
                    ┌───────────────────┐
                    │  Toggle Course    │
                    │ useSelectedCourses│
                    │ toggleCourse(id)  │
                    └─────────┬─────────┘
                              │
                              │ watch(selectedCourseIds)
                              ▼
                    ┌───────────────────┐
                    │ Fetch Combinations│
                    │ $fetch(/api/       │
                    │   combinations)    │
                    │ body: { ids }      │
                    └─────────┬─────────┘
                              │
                              │ setCombinations(result)
                              ▼
                    ┌───────────────────┐
                    │ useCombinations   │
                    │ combinations[]    │
                    └─────────┬─────────┘
                              │
                              │ Navigate to
                              ▼
                    ┌─────────────────────┐
                    │  Combinations Page  │
                    │  (combinations.vue) │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │ TimeTable[]   │  │
                    │  │ Display each  │  │
                    │  │ combination   │  │
                    │  └───────────────┘  │
                    │                     │
                    │  ┌───────────────┐  │
                    │  │ Filter by     │  │
                    │  │ sections      │  │
                    │  │               │  │
                    │  │useSelectedSections
                    │  │filterCombinations │
                    │  └───────────────┘  │
                    └─────────────────────┘
```

---

## Component Hierarchy

```
app.vue
└── UApp
    └── NuxtPage (Router View)
        │
        ├── pages/login.vue
        │   ├── Logo
        │   └── LoginWithGoogle
        │
        ├── pages/index.vue (Home)
        │   ├── Logo
        │   ├── SearchField
        │   └── SemesterSwitch ─────────────► useSelectedSemester
        │
        ├── pages/search.vue
        │   └── SearchLayout ◄── Props: selectedCoursesCount, totalCredits, totalCombinations
        │       ├── LogoSmall
        │       ├── SearchField
        │       ├── ResultTabs
        │       ├── CourseCard[] ─────────► emit('select') → handleToggleCourse
        │       │   └── CardScheduleTable
        │       └── SearchStats ─────────► useSelectedCourses, useSelectedSections,
        │           ├── SemesterSwitch       useCombinations
        │           └── StatItem[]
        │
        └── pages/combinations.vue
            └── SearchLayout ◄── Props: courseManager, totalCombinations
                ├── LogoSmall
                ├── TimeTable[] ──────────► Displays TimetableEvent[]
                └── SearchStats ──────────► useSelectedCourses, useSelectedSections,
                    └── Course filter UI     useCombinations
```

---

## API Endpoints

| Endpoint            | Method | Description                    | Request                             | Response           |
| ------------------- | ------ | ------------------------------ | ----------------------------------- | ------------------ |
| `/api/search`       | GET    | Search courses                 | `?q={term}&semester={sem}&page={n}` | `ICourseDTO[]`     |
| `/api/courses`      | POST   | Get courses by IDs             | `string[]` (body)                   | `ICourseDTO[]`     |
| `/api/semesters`    | GET    | List available semesters       | -                                   | `string[]`         |
| `/api/combinations` | POST   | Generate schedule combinations | `{ ids: string[] }`                 | `AssignmentType[]` |
| `/api/auth/[...]`   | \*     | NextAuth endpoints             | -                                   | -                  |

---

## Type Definitions

```typescript
// Course Types
interface ICourseDTO {
  _id: string;
  code: string;
  name: string;
  level: string;
  credits: number;
  faculties: string[];
  semester: string;
  year: number;
  prerequisite: string;
  antirequisite: string;
  description: string;
  gerCategory?: string | null;
  sections: ISectionDTO[];
}

interface ISectionDTO {
  sectionId: string;
  quarter?: string | null;
  dateRange: IDateRangeDTO;
  slots: ISlotDTO[];
}

interface ISlotDTO {
  day: Day; // "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"
  startTime: string;
  endTime: string;
}

// Combinator Types
type AssignmentType = { [courseId: string]: string }; // courseId -> sectionId

interface TimetableEvent {
  id: string | number;
  title: string;
  subtitle?: string;
  day: Day;
  startTime: string;
  endTime: string;
  color?: string;
}
```

---

## Improvement Recommendations

### 1. **State Management Improvements**

#### 1.1 Use Pinia for Complex State

The current composable-based approach works but has limitations:

```
CURRENT ISSUE:
- Each composable creates independent useState calls
- No centralized store debugging
- No devtools integration for state inspection
- Watchers and computed properties are scattered across components
```

**Recommendation:** Migrate to **Pinia** (Nuxt's recommended state management):

```typescript
// stores/courseSelection.ts
export const useCourseSelectionStore = defineStore('courseSelection', () => {
  const selectedCourseIds = ref<string[]>([]);
  const selectedSections = ref<Map<string, Set<string>>>(new Map());
  const combinations = ref<AssignmentType[]>([]);

  // Getters
  const totalCredits = computed(() => /* calculate from course details */);
  const totalCombinations = computed(() => combinations.value.length);

  // Actions with better organization
  const toggleCourse = (id: string) => { /* ... */ };
  const fetchCombinations = async () => { /* ... */ };

  return { /* ... */ };
});
```

**Benefits:**

- DevTools integration for debugging
- Centralized state mutations
- Better TypeScript support
- Time-travel debugging

---

### 2. **Reduce Prop Drilling**

#### Current Issue:

```
SearchLayout receives props from pages
    └── Passes them down to SearchStats
        └── Which uses composables anyway
```

**Recommendation:** Use `provide/inject` or Pinia to avoid redundant prop passing:

```vue
<!-- pages/search.vue - BEFORE -->
<SearchLayout
  :selected-courses-count="selectedCourseIds.length"
  :total-credits="..."
  :total-combinations="..."
></SearchLayout>
<!-- pages/search.vue - AFTER (with Pinia) -->
<SearchLayout />
<!-- SearchStats can directly access store -->
```

---

### 3. **Separate Concerns in `search.vue`**

The `search.vue` page handles too many responsibilities:

```
Current responsibilities:
1. Search functionality
2. Course selection management
3. API calls for combinations
4. Tab management
5. Loading states
```

**Recommendation:** Extract into separate composables:

```typescript
// composables/useSearch.ts
export function useSearch() {
  const searchTerm = ref("");
  const searchResults = ref<ICourseDTO[]>([]);
  const loading = ref(false);

  const performSearch = async () => {
    /* ... */
  };

  return { searchTerm, searchResults, loading, performSearch };
}

// composables/useCourseDetails.ts
export function useCourseDetails(selectedIds: Ref<string[]>) {
  const details = ref<ICourseDTO[]>([]);
  const loading = ref(false);

  const fetchDetails = async () => {
    /* ... */
  };

  return { details, loading, fetchDetails };
}
```

---

### 4. **Add Error Handling & Loading States**

#### Current Issue:

- Minimal error handling in API calls
- No global error boundary
- Inconsistent loading state management

**Recommendation:**

```typescript
// composables/useAsyncState.ts
export function useAsyncState<T>(asyncFn: () => Promise<T>) {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const loading = ref(false);

  const execute = async () => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await asyncFn();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  };

  return { data, error, loading, execute };
}
```

Add a global error boundary component:

```vue
<!-- components/ErrorBoundary.vue -->
<script setup>
const error = useError();
</script>
<template>
  <div v-if="error" class="error-container">
    <h2>Something went wrong</h2>
    <p>{{ error.message }}</p>
    <UButton @click="clearError()">Try Again</UButton>
  </div>
  <slot v-else />
</template>
```

---

### 5. **Optimize API Calls**

#### Current Issue:

- Combinations are re-fetched on every course selection change
- No caching mechanism

**Recommendation:** Use `useFetch` with caching or implement debouncing:

```typescript
// Debounced combination fetching
const debouncedFetchCombinations = useDebounceFn(async () => {
  if (selectedCourseIds.value.length === 0) return;

  const result = await $fetch("/api/combinations", {
    method: "POST",
    body: { ids: selectedCourseIds.value },
  });
  setCombinations(result);
}, 500);

watch(selectedCourseIds, debouncedFetchCombinations, { deep: true });
```

---

### 6. **TypeScript Improvements**

#### Current Issues:

- Some `any` types in API handlers
- Inconsistent type exports

**Recommendation:**

```typescript
// types/api.ts - Centralized API types
export interface SearchParams {
  q: string;
  semester: string;
  page?: number;
  maxResults?: number;
}

export interface CombinationRequest {
  ids: string[];
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
}
```

---

### 7. **Component Extraction**

#### Recommendation: Extract reusable components

```
Current: CourseCard contains collapsible sections inline
Better: Extract to separate components

CourseCard/
├── index.vue (main component)
├── CourseHeader.vue
├── CourseMeta.vue
├── SectionsCollapsible.vue
└── DescriptionCollapsible.vue
```

---

### 8. **Add Unit Tests**

The codebase lacks testing. Add tests for:

```
- Composables (state management logic)
- API handlers (server utilities)
- Combinator algorithm (critical business logic)
- Components (using Vue Test Utils)
```

---

### 9. **Performance Optimizations**

```typescript
// Use shallowRef for large arrays to avoid deep reactivity
const combinations = shallowRef<AssignmentType[]>([]);

// Virtualize long lists
// Use @tanstack/vue-virtual for CourseCard lists
<VirtualList :items="searchResults" :item-size="200">
  <template #default="{ item }">
    <CourseCard :course="item" />
  </template>
</VirtualList>
```

---

### 10. **Documentation & Code Organization**

```
Recommended folder structure:
app/
├── components/
│   ├── course/        # Course-related components
│   ├── layout/        # Layout components
│   ├── search/        # Search-related components
│   └── ui/            # Generic UI components
├── composables/
│   ├── state/         # State management composables
│   └── utils/         # Utility composables
├── pages/
└── types/             # Move types closer to app
```

---

## Summary

The current architecture follows Vue 3 best practices with composable-based state management. However, as the application grows, consider:

1. **Short-term:** Add error handling, TypeScript improvements, and debouncing
2. **Medium-term:** Migrate to Pinia, extract components, add tests
3. **Long-term:** Implement virtualization, caching, and comprehensive documentation

The codebase is well-structured for its current size but would benefit from the above improvements to scale effectively.
