import type { ICourseDTO } from "../server/models/Course";
import type { ISlotDTO } from "../server/models/Course";

interface CourseManager {
  courses: ICourseDTO[];
  getCourseById(id: string): ICourseDTO | null;
  getSlotsBySectionId(id: string): ISlotDTO[] | null; // sectionID = courseId.sectionNo
}
class CourseManager implements CourseManager {
  courses: ICourseDTO[];

  constructor(courses: ICourseDTO[]) {
    this.courses = courses;
  }
  getCourseById(id: string): ICourseDTO | null {
    return this.courses.find((course) => course._id === id) || null;
  }
  getSlotsBySectionId(id: string): ISlotDTO[] | null {
    const [courseId, sectionNo] = id.split(".");
    if (!courseId || !sectionNo) throw new Error("Invalid section ID format");
    const course = this.getCourseById(courseId);
    if (!course) return null;
    const section = course.sections.find(
      (sec) => sec.sectionId.toString() === sectionNo
    );
    return section ? section.slots : null;
  }

  getSectionNoBySectionId(id: string): string {
    const [courseId, sectionNo] = id.split(".");
    if (!courseId || !sectionNo) throw new Error("Invalid section ID format");
    return sectionNo;
  }
}

export default CourseManager;
