import { ICourse, ISection } from "../server/models/Course";
import dbConnect from "../server/db";
import Course from "../server/models/Course";

type CoursesType = ICourse[];
type CompatibilityMatrixType = {
  [sectionId1: string]: { [sectionId2: string]: boolean };
};
type SectionType = ICourse["sections"][0];
type DomainsType = { [courseId: string]: Set<string> };
type SectionByIdType = { [sectionId: string]: SectionType };
type NeighborsType = { [courseId: string]: Set<string> };
type AdjacencyType = {
  [sectionId: string]: { [courseId: string]: Set<string> };
};
// the combinations will be array of arrays of section ids
type AssignmentType = { [courseId: string]: string };

interface ICombinator {
  // --- Properties ---
  courses: CoursesType;
  compatibilityMatrix: CompatibilityMatrixType;
  domains: DomainsType;
  sectionById: SectionByIdType;
  neighbors: NeighborsType;
  adjacency: AdjacencyType;
  allSolutions: AssignmentType[];

  // --- Main Method ---
  /**
   * The main entry point for generating course combinations.
   * Orchestrates the entire process from fetching data to backtracking.
   * @param courseIds - An array of course IDs selected by the user.
   * @returns A promise that resolves to an array of valid section assignments.
   */
  generate(courseIds: string[]): Promise<AssignmentType[]>;

  // --- Step 1: Data Preparation ---

  // Fetches course data from the database and initializes domains and section lookups.
  fetchCoursesByIds(courseIds: string[]): Promise<void>;

  // --- Step 2: Pairwise Compatibility ---
  buildCompatibilityMatrix(): void;

  areSectionsCompatible(sectionA: SectionType, sectionB: SectionType): boolean;

  // --- Step 3: AC-3 Arc Consistency ---
  /**
   * Runs the AC-3 algorithm to prune the domains of sections that cannot be part of any valid solution.
   * @returns `true` if a solution is still possible, `false` if a domain becomes empty.
   */
  runAC3(): boolean;

  /**
   * The REVISE function for the AC-3 algorithm. Removes values from the domain of Xi
   * that have no supporting value in the domain of Xj.
   * @param courseId_i - The ID of the first course (Xi).
   * @param courseId_j - The ID of the second course (Xj).
   * @returns `true` if the domain of Xi was revised, `false` otherwise.
   */
  revise(courseId_i: string, courseId_j: string): boolean;

  // --- Step 4: Backtracking Search ---
  /**
   * Builds an adjacency list from the pruned domains and compatibility matrix
   * to speed up lookups during the backtracking search (MAC).
   */
  buildAdjacencyList(): void;

  /**
   * The backtracking algorithm that finds all valid combinations of sections.
   * @param assignment - The current assignment of sections to courses.
   * @param courseIndex - The index of the course to assign next.
   */
  backtrack(assignment: AssignmentType, courseIndex: number): void;

  // --- Helper Methods ---
  getSectionID(courseId: string, sectionId: string): string;
}
// user will give me list of ids of courses they want to take, I'll fetch those courses from the DB

class Combinator implements ICombinator {
  courses: CoursesType;
  compatibilityMatrix: CompatibilityMatrixType;
  domains: DomainsType = {};
  sectionById: SectionByIdType = {};
  neighbors: NeighborsType = {};
  adjacency: AdjacencyType = {};
  allSolutions: AssignmentType[] = [];

  constructor() {
    this.courses = [];
    this.compatibilityMatrix = {};
  }
  // this class contains all the functions needed to generated possible combinations of course sections without time clashes
  // flow:
  // 1. build compatibility matrix for all sections of all courses
  // 2. perform arc 3 pruning on the matrix to remove incompatible sections
  // 3. generate combinations using backtracking
  // We'll say that section id is, course_id.section_no (e.g. axxefsdfsdf.1)
  async fetchCoursesByIds(ids: string[]) {
    await dbConnect();
    const courses = await Course.find({ _id: { $in: ids } }).exec();

    if (courses.length !== ids.length) {
      const foundIds = courses.map((c) => c.id.toString());
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));
      throw new Error(
        `Could not find courses with IDs: ${notFoundIds.join(", ")}`
      );
    }

    this.courses = courses.map((course) => course.toObject());
  }
  buildCompatibilityMatrix() {
    for (const course of this.courses) {
      for (const section of course.sections) {
        const sectionID = this.getSectionID(
          course._id.toString(),
          section.sectionId
        );

        this.compatibilityMatrix[sectionID] = {};
        for (const otherCourse of this.courses) {
          if (otherCourse._id.toString() === course._id.toString()) continue;
          for (const otherSection of otherCourse.sections) {
            const otherSectionID = this.getSectionID(
              otherCourse._id.toString(),
              otherSection.sectionId
            );
            const isCompatible = this.areSectionsCompatible(
              section,
              otherSection
            );
            this.compatibilityMatrix[sectionID][otherSectionID] = isCompatible;
          }
        }
      }
    }
  }

  areSectionsCompatible(sectionA: ISection, sectionB: ISection): boolean {
    // Using bit masks to represent the timings of the classes, this makes checking for conflicts very easy and fast.
    // Two masks are used:
    // 1. One for time of the course in the week. One bit represents 5 minutes.
    // 2. One for the days of the year. One bit represents one day.
    // A clash occurs if and only if there's an overlap in BOTH time and day.

    const slotMask1 = sectionA.fiveMinuteBitMask;
    const slotMask2 = sectionB.fiveMinuteBitMask;
    const dayMask1 = sectionA.dateRange.oneDayBitMask;
    const dayMask2 = sectionB.dateRange.oneDayBitMask;

    // Check for time conflict
    let timeConflict = false;
    for (let i = 0; i < slotMask1.length; i++) {
      if ((slotMask1[i] & slotMask2[i]) !== 0) {
        timeConflict = true;
        break;
      }
    }

    if (!timeConflict) {
      return true; // No time conflict, so they are compatible
    }

    // If there is a time conflict, check for day conflict
    let dayConflict = false;
    for (let i = 0; i < dayMask1.length; i++) {
      if ((dayMask1[i] & dayMask2[i]) !== 0) {
        dayConflict = true;
        break;
      }
    }

    // If there's a time conflict, they are compatible only if there is NO day conflict.
    // So, we return the opposite of dayConflict.
    return !dayConflict;
  }

  runAC3(): boolean {
    const queue: [string, string][] = [];

    // Initialize the queue with all arcs
    const courseIds = this.courses.map((course) => course._id.toString());
    for (let i = 0; i < courseIds.length; i++) {
      for (let j = 0; j < courseIds.length; j++) {
        if (i !== j) {
          queue.push([courseIds[i], courseIds[j]]);
        }
      }
    }

    while (queue.length > 0) {
      const [courseId_i, courseId_j] = queue.shift()!;
      if (this.revise(courseId_i, courseId_j)) {
        if (this.domains[courseId_i].size === 0) {
          return false; // Domain wiped out, no solution possible
        }
        for (const neighborId of this.neighbors[courseId_i]) {
          if (neighborId !== courseId_j) {
            queue.push([neighborId, courseId_i]);
          }
        }
      }
    }

    return true;
  }

  getSectionID(courseId: string, sectionId: string): string {
    return `${courseId}.${sectionId}`;
  }

  async generate(courseIds: string[]) {
    await this.fetchCoursesByIds(courseIds);

    this.buildCompatibilityMatrix();

    console.log("Successfully generated compatibility matrix.");
    return {
      compatibilityMatrix: this.compatibilityMatrix,
    };
  }
}
// ids: 691c3d8abd3441973ad038ff,691c3d8abd3441973ad03901, 691c3d8abd3441973ad03904, 691c3d8abd3441973ad0390b
export default Combinator;
