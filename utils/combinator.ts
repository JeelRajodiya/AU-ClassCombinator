import { ICourse, ICourseCore } from "../server/models/Course";
import dbConnect from "../server/db";
import Course from "../server/models/Course";

type CoursesType = ICourse[];
type CompatibilityMatrixType = {
  [sectionId1: string]: { [sectionId2: string]: boolean };
};

interface Combinator {
  courses: CoursesType;
  // 2D dictionary for compatibility matrix
  compatibilityMatrix: CompatibilityMatrixType;
  areSectionsCompatible(
    section1: ICourse["sections"][0],
    section2: ICourse["sections"][0]
  ): boolean;
  // fetch courses from DB and assign to this.courses
  fetchCoursesByIds(ids: string[]): Promise<void>; // will modify the courses attribute
  buildCompatibilityMatrix(): void; // will modify the compatibilityMatrix attribute
  getSectionID(courseId: string, sectionId: string): string;
  generate(courseIds: string[]): Promise<any>; // Main method
}

// user will give me list of ids of courses they want to take, I'll fetch those courses from the DB

class Combinator implements Combinator {
  courses: CoursesType;
  compatibilityMatrix: CompatibilityMatrixType;

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

  areSectionsCompatible(
    section1: ICourse["sections"][0],
    section2: ICourse["sections"][0]
  ): boolean {
    // Using bit masks to represent the timings of the classes, this makes checking for conflicts very easy and fast.
    // Two masks are used:
    // 1. One for time of the course in the week. One bit represents 5 minutes.
    // 2. One for the days of the year. One bit represents one day.
    // A clash occurs if and only if there's an overlap in BOTH time and day.

    const slotMask1 = section1.fiveMinuteBitMask;
    const slotMask2 = section2.fiveMinuteBitMask;
    const dayMask1 = section1.dateRange.oneDayBitMask;
    const dayMask2 = section2.dateRange.oneDayBitMask;

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

  getSectionID(courseId: string, sectionId: string): string {
    return `${courseId}.${sectionId}`;
  }

  buildCompatibilityMatrix() {
    for (const course of this.courses) {
      for (const section of course.sections) {
        const sectionID = this.getSectionID(
          course.id.toString(),
          section.sectionId
        );

        this.compatibilityMatrix[sectionID] = {};
        for (const otherCourse of this.courses) {
          if (otherCourse.id.toString() === course.id.toString()) continue;
          for (const otherSection of otherCourse.sections) {
            const otherSectionID = this.getSectionID(
              otherCourse.id.toString(),
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

  async generate(courseIds: string[]) {
    await this.fetchCoursesByIds(courseIds);
    this.buildCompatibilityMatrix();

    console.log("Successfully generated compatibility matrix.");
    return {
      compatibilityMatrix: this.compatibilityMatrix,
    };
  }
}
