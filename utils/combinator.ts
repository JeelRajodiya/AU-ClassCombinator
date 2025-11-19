import type { ICourse, ISection } from "../server/models/Course";
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
// key is course id, value is section id
export type AssignmentType = { [courseId: string]: string };

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

    // Initialize domains, neighbors, and sectionById
    this.domains = {};
    this.neighbors = {};
    this.sectionById = {};

    for (const course of this.courses) {
      const courseId = course._id.toString();
      this.domains[courseId] = new Set();
      this.neighbors[courseId] = new Set();

      for (const section of course.sections) {
        const sectionID = this.getSectionID(courseId, section.sectionId);
        this.domains[courseId].add(sectionID);
        this.sectionById[sectionID] = section;
      }

      for (const otherCourse of this.courses) {
        if (otherCourse._id.toString() !== courseId) {
          this.neighbors[courseId].add(otherCourse._id.toString());
        }
      }
    }
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

    const slotMask1 = sectionA.fiveMinuteBitMask.buffer;
    const slotMask2 = sectionB.fiveMinuteBitMask.buffer;
    const dayMask1 = sectionA.dateRange.oneDayBitMask.buffer;
    const dayMask2 = sectionB.dateRange.oneDayBitMask.buffer;

    // Check for time conflict
    let timeConflict = false;

    for (let i = 0; i < slotMask1.length; i++) {
      const val1 = slotMask1[i];
      const val2 = slotMask2[i];
      if (val1 !== undefined && val2 !== undefined && (val1 & val2) !== 0) {
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
      const val1 = dayMask1[i];
      const val2 = dayMask2[i];
      if (val1 !== undefined && val2 !== undefined && (val1 & val2) !== 0) {
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
          const id1 = courseIds[i];
          const id2 = courseIds[j];
          if (id1 && id2) {
            queue.push([id1, id2]);
          }
        }
      }
    }

    while (queue.length > 0) {
      const [courseId_i, courseId_j] = queue.shift()!;
      if (this.revise(courseId_i, courseId_j)) {
        const domain = this.domains[courseId_i];
        if (!domain || domain.size === 0) {
          return false; // Domain wiped out, no solution possible
        }
        const neighbors = this.neighbors[courseId_i];
        if (neighbors) {
          for (const neighborId of neighbors) {
            if (neighborId !== courseId_j) {
              queue.push([neighborId, courseId_i]);
            }
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
    this.allSolutions = [];
    await this.fetchCoursesByIds(courseIds);

    this.buildCompatibilityMatrix();

    if (!this.runAC3()) {
      return [];
    }

    this.buildAdjacencyList();
    this.backtrack({}, 0);

    return this.allSolutions;
  }

  revise(courseId_i: string, courseId_j: string): boolean {
    let revised = false;
    const domain_i = this.domains[courseId_i];
    const domain_j = this.domains[courseId_j];

    if (!domain_i || !domain_j) return false;

    for (const sectionId_i of domain_i) {
      let hasSupport = false;
      for (const sectionId_j of domain_j) {
        const compat = this.compatibilityMatrix[sectionId_i];
        if (compat && compat[sectionId_j]) {
          hasSupport = true;
          break;
        }
      }
      if (!hasSupport) {
        domain_i.delete(sectionId_i);
        revised = true;
      }
    }
    return revised;
  }

  buildAdjacencyList(): void {
    this.adjacency = {};
    for (const course of this.courses) {
      const courseId = course._id.toString();
      const domain = this.domains[courseId];
      if (!domain) continue;

      for (const sectionId of domain) {
        this.adjacency[sectionId] = {};
        for (const otherCourse of this.courses) {
          const otherCourseId = otherCourse._id.toString();
          if (courseId === otherCourseId) continue;

          this.adjacency[sectionId][otherCourseId] = new Set();
          const otherDomain = this.domains[otherCourseId];
          if (!otherDomain) continue;

          for (const otherSectionId of otherDomain) {
            const compat = this.compatibilityMatrix[sectionId];
            if (compat && compat[otherSectionId]) {
              this.adjacency[sectionId][otherCourseId].add(otherSectionId);
            }
          }
        }
      }
    }
  }

  backtrack(assignment: AssignmentType, courseIndex: number): void {
    if (courseIndex === this.courses.length) {
      this.allSolutions.push({ ...assignment });
      return;
    }

    const course = this.courses[courseIndex];
    if (!course) return; // Should not happen if index is valid

    const courseId = course._id.toString();
    const domain = this.domains[courseId];
    if (!domain) return; // Should not happen if initialized correctly

    for (const sectionId of domain) {
      let consistent = true;
      for (const assignedCourseId in assignment) {
        const assignedSectionId = assignment[assignedCourseId];
        if (!assignedSectionId) continue;

        const compat = this.compatibilityMatrix[sectionId];
        if (!compat || !compat[assignedSectionId]) {
          consistent = false;
          break;
        }
      }

      if (consistent) {
        assignment[courseId] = sectionId;
        this.backtrack(assignment, courseIndex + 1);
        delete assignment[courseId];
      }
    }
  }
}
export default Combinator;
