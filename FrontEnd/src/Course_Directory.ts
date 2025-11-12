import { toTitleCase, sortWeekdays } from "./utils/timeUtils";
import { checkForConflict } from "./utils/conflictChecker";
import { getNumberCombinations } from "./utils/combinationGenerator";

type Course = {
  Code: string;
  Level: string;
  Name: string;
  Credits: string;
  Faculties: string[];
  Semester: string;
  Prerequisite: string;
  Description: string;
  Sections: {
    [key: string]: {
      [key: string]: string[][];
    };
  };
  isBiSem: boolean;
};
export type { Course };

class CourseDirectory {
  private winter: Course[];
  private monsoon: Course[];
  private activeSem: Course[];
  public activeSemName: string;

  constructor(winter: any, monsoon: any) {
    this.winter = winter;
    this.monsoon = monsoon;
    this.activeSem = this.winter;
    this.activeSemName = "Winter";
  }
  public getSemActive() {
    return this.activeSem;
  }
  public changeActiveSemToWinter() {
    localStorage.setItem("activeSem", "winter");
    this.activeSem = this.winter;
    this.activeSemName = "Winter";
  }
  public changeActiveSemToMonsoon() {
    localStorage.setItem("activeSem", "monsoon");
    this.activeSem = this.monsoon;
    this.activeSemName = "Monsoon";
  }
  public getWinter() {
    return this.winter;
  }
  public getMonsoon() {
    return this.monsoon;
  }
  public getActiveSemCourses() {
    let courses = [];
    for (let course of this.activeSem) {
      courses.push(course.Code);
    }
    return courses;
  }
  public getActiveSemCourseByCode(courseCode: string) {
    for (let course of this.activeSem) {
      if (course.Code === courseCode) {
        return course;
      }
    }
  }

  private getDateAndTimeOfCourse(code: string, section: number) {
    const sectionStr = String(section);
    const course = this.getActiveSemCourseByCode(code);
    const sectionObj = course?.Sections[sectionStr];
    return sectionObj;
  }

  public checkConflict(
    code1: string,
    section1: number,
    code2: string,
    section2: number
  ) {
    const course1Data = this.getDateAndTimeOfCourse(code1, section1);
    const course2Data = this.getDateAndTimeOfCourse(code2, section2);
    if (!course1Data || !course2Data) {
      return false;
    }
    return checkForConflict(course1Data, course2Data);
  }
  private getTotalSections(code: string) {
    const course = this.getActiveSemCourseByCode(code);
    return Object.keys(course!["Sections"]).map(
      (section) => `${code}-${parseInt(section)}`
    );
  }

  public generatePossibleCombinations(codes: string[]) {
    let totalSections = [];
    for (let code of codes) {
      totalSections.push(this.getTotalSections(code));
    }

    const combinationWithClashes = getNumberCombinations(
      totalSections,
      codes.length
    );

    const finalCombinations: string[][] = [];
    let parseCombinationCode = (c: string) => c.split("-");
    for (let i = 0; i < combinationWithClashes.length; i++) {
      let activeCombination = combinationWithClashes[i];
      let doesHaveClashes = false;

      for (let j = 0; j < activeCombination.length; j++) {
        for (let k = 0; k < activeCombination.length; k++) {
          if (k == j) {
            continue;
          }
          let course1 = parseCombinationCode(activeCombination[j]);
          let course2 = parseCombinationCode(activeCombination[k]);

          let code1 = course1[0];
          let code2 = course2[0];
          let section1 = Number(course1[1]);
          let section2 = Number(course2[1]);

          if (this.checkConflict(code1, section1, code2, section2)) {
            doesHaveClashes = true;
          }
        }
      }
      if (!doesHaveClashes) {
        finalCombinations.push(activeCombination);
      }
    }
    return finalCombinations;
  }
  public search(query: string) {
    const courses = this.getSemActive();
    const results: { course: Course; score: number }[] = [];
    for (let course of courses) {
      let score = 0;

      if (course.Code.replace(" ", "").includes(query.toUpperCase())) {
        score += 5; // Code match has higher weight
      }
      if (course.Description.includes(query)) {
        score += 3;
      }
      if (course.Faculties.join(" ").includes(toTitleCase(query))) {
        score += 2;
      }
      if (course.Name.includes(toTitleCase(query))) {
        score += 4;
      }

      if (score > 0) {
        results.push({ course, score });
      }
    }
    results.sort((a, b) => b.score - a.score);

    return results.map((result) => result.course);
  }
  public getScheduleFromCodeAndSection(codeNSec: string): string[] {
    const [code, sec] = codeNSec.split("-");
    const course = this.getActiveSemCourseByCode(code);
    const section = course?.Sections[sec];

    const days = Object.keys(section!);
    const times = days.map((day) => section![day][0]);

    const formattedTimes = times.map((time) => {
      if (time.length % 2 === 0 && time.length > 2) {
        let allTimes = [];
        allTimes.push(" ");
        for (let t = 0; t < time.length; t++) {
          allTimes.push([time[t] + "-" + time[++t]]);
        }
        return allTimes.join(",  ");
      } else {
        return [time[0] + "-" + time[time.length - 1]];
      }
    });

    const formattedResult = [];
    for (let i = 0; i < days.length; i++) {
      formattedResult.push(`${days[i]} ${formattedTimes[i]} `);
    }
    return formattedResult;
  }
  public getUsedDays(codeNSecs: string[]): string[] {
    let days: string[] = [];
    let code: string;
    let sec: string;

    for (let codeNSec of codeNSecs) {
      [code, sec] = codeNSec.split("-");
      let course = this.getActiveSemCourseByCode(code);
      let section = course?.Sections[sec];
      for (let day of Object.keys(section!)) {
        if (!days.includes(day)) {
          days.push(day);
        }
      }
    }
    return sortWeekdays(days);
  }

  public sumCredits(selected: string[]): number {
    let totalCredits = 0;
    for (let code of selected) {
      totalCredits += Number(this.getActiveSemCourseByCode(code)!.Credits);
    }
    return totalCredits;
  }
}

export default CourseDirectory;
