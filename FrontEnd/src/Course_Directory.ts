// import * as fs from "fs";
import loadsh from "lodash";

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
		this.activeSem = this.winter;
		this.activeSemName = "Winter";
	}
	public changeActiveSemToMonsoon() {
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
	private strToTime(str: string) {
		let time = str.split(":");
		let hour = parseInt(time[0]);
		let min = parseInt(time[1]);
		return hour * 60 + min;
	}
	private strToDate(str: string) {
		let date = str.split("-");
		let day = parseInt(date[0]);
		let month = parseInt(loadsh.trimStart(date[1], "0"));
		let year = parseInt(date[2]);
		// console.log(date);
		return new Date(year, month, day);
	}
	private checkForTimeConflict(course1Time: string[], course2Time: string[]) {
		let course1StartTime = this.strToTime(course1Time[0]);
		let course1EndTime = this.strToTime(
			course1Time[course1Time.length - 1]
		);
		let course2StartTime = this.strToTime(course2Time[0]);
		// console.log(course1Time);
		let course2EndTime = this.strToTime(
			course2Time[course2Time.length - 1]
		);
		// console.log(
		// 	course1StartTime,
		// 	course1EndTime,
		// 	course2StartTime,
		// 	course2EndTime
		// );
		if (
			(course1StartTime < course2StartTime &&
				course2StartTime < course1EndTime) ||
			(course1StartTime < course2EndTime &&
				course2EndTime < course1EndTime)
		) {
			return true;
		}
		return false;
	}
	private checkForDateConflict(course1Date: string[], course2Date: string[]) {
		let course1StartDate = this.strToDate(course1Date[0]);
		let course1EndDate = this.strToDate(course1Date[1]);
		let course2StartDate = this.strToDate(course2Date[0]);
		let course2EndDate = this.strToDate(course2Date[1]);
		// console.log(
		// 	course1StartDate,
		// 	course1EndDate,
		// 	course2StartDate,
		// 	course2EndDate
		// );
		if (
			(course1StartDate < course2StartDate &&
				course2StartDate < course1EndDate) ||
			(course1StartDate < course2EndDate &&
				course2EndDate < course1EndDate)
		) {
			return true;
		}
		return false;
	}

	private getDateAndTimeOfCourse(code: string, section: number) {
		const sectionStr = String(section);
		const course = this.getActiveSemCourseByCode(code);
		const sectionObj = course?.Sections[sectionStr];
		// console.log(sectionObj);
		return sectionObj;
	}
	private checkForDayConflict(
		course1Day: string[][],
		course2Day: string[][]
	) {
		const course1Date = course1Day[1];
		const course1Time = course1Day[0];
		const course2Date = course2Day[1];
		const course2Time = course2Day[0];
		const dateConflict = this.checkForDateConflict(
			course1Date,
			course2Date
		);
		const timeConflict = this.checkForTimeConflict(
			course1Time,
			course2Time
		);
		// console.log(timeConflict, dateConflict);
		if (dateConflict && timeConflict) {
			return true;
		}
		return false;
	}

	public checkForConflict(
		code1: string,
		section1: number,
		code2: string,
		section2: number
	) {
		const course1Data = this.getDateAndTimeOfCourse(code1, section1);
		const course2Data = this.getDateAndTimeOfCourse(code2, section2);
		let sameDays = [];
		for (let day of Object.keys(course1Data!)) {
			if (course2Data?.hasOwnProperty(day)) {
				sameDays.push(day);
			}
		}
		if (sameDays.length === 0) {
			return false;
		}
		for (let day of sameDays) {
			const course1Day = course1Data![day];
			const course2Day = course2Data![day];
			const conflict = this.checkForDayConflict(course1Day, course2Day);
			if (conflict) {
				return true;
			}
		}

		return false;
	}
	private getTotalSections(code: string) {
		const course = this.getActiveSemCourseByCode(code);
		return Object.keys(course!["Sections"]).map(
			(section) => `${code}-${parseInt(section)}`
		);
	}
	private getNumberCombinations(arr: string[][], n: number) {
		let i,
			j,
			k,
			elem,
			l = arr.length,
			childperm,
			ret: string[][] = [];
		if (n == 1) {
			for (i = 0; i < arr.length; i++) {
				for (j = 0; j < arr[i].length; j++) {
					ret.push([arr[i][j]]);
				}
			}
			return ret;
		} else {
			for (i = 0; i < l; i++) {
				elem = arr.shift();
				for (j = 0; j < elem!.length; j++) {
					childperm = this.getNumberCombinations(arr.slice(), n - 1);
					for (k = 0; k < childperm.length; k++) {
						ret.push([elem![j]].concat(childperm[k]));
					}
				}
			}
			return ret;
		}
	}
	public generatePossibleCombinations(codes: string[]) {
		let totalSections = [];
		for (let code of codes) {
			totalSections.push(this.getTotalSections(code));
		}

		const combinationWithClashes = this.getNumberCombinations(
			totalSections,
			codes.length
		);

		// console.log(combinationWithClashes);
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

					if (
						this.checkForConflict(code1, section1, code2, section2)
					) {
						doesHaveClashes = true;
					}
				}
			}
			if (!doesHaveClashes) {
				finalCombinations.push(activeCombination);
			}
		}
		// console.log(finalCombinations);
	}
	private toTitleCase(str: string) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}
	public search(query: string) {
		const courses = this.getSemActive();
		const results: Course[] = [];
		for (let course of courses) {
			if (
				course.Code.includes(query.toUpperCase()) ||
				course.Description.includes(query) ||
				course.Faculties.join(" ").includes(this.toTitleCase(query)) ||
				course.Name.includes(this.toTitleCase(query))
			) {
				results.push(course);
			}
		}
		return results;
	}
}

export default CourseDirectory;
