// import * as fs from "fs";
import loadsh, { filter } from "lodash";

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
		// if (
		// 	localStorage.getItem("activeSem") === "winter" ||
		// 	localStorage.getItem("activeSem") === null
		// ) {
		// 	this.activeSem = this.winter;
		// 	this.activeSemName = "Winter";
		// } else {
		// 	this.activeSem = this.monsoon;
		// 	this.activeSemName = "Monsoon";
		// }

		this.activeSem = this.monsoon;
		this.activeSemName = "Monsoon";
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
	private organizeTime(time: string[]) {
		let organizedTime: string[][] = [];
		for (let i = 0; i < time.length; i += 2) {
			organizedTime.push([time[i], time[i + 1]]);
		}
		// convert [ [ "13:00","14:30"] , ["14:30","16:00"] ] to [["13:00","16:00]]
		for (let i = 0; i < organizedTime.length - 1; i++) {
			if (organizedTime[i][1] === organizedTime[i + 1][0]) {
				organizedTime[i][1] = organizedTime[i + 1][1];
				organizedTime.splice(i + 1, 1);
				i--;
			}
		}
		// remove duplicate time pairs

		let organizedTime2: string[][] = [];
		for (let i = 0; i < organizedTime.length; i++) {
			if (!organizedTime2.includes(organizedTime[i])) {
				organizedTime2.push(organizedTime[i]);
			}
		}

		// console.log(time, "=>", organizedTime);
		return organizedTime;
	}
	private checkTimeConflictByPairs(
		course1Pair: string[],
		course2Pair: string[]
	): boolean {
		let course1StartTime = this.strToTime(course1Pair[0]);
		let course1EndTime = this.strToTime(course1Pair[1]);
		let course2StartTime = this.strToTime(course2Pair[0]);
		let course2EndTime = this.strToTime(course2Pair[1]);
		if (
			(course1StartTime <= course2StartTime &&
				course2StartTime < course1EndTime) ||
			(course2StartTime <= course1StartTime &&
				course1StartTime < course2EndTime)
		) {
			return true;
		}
		return false;
	}
	private checkForTimeConflict(course1Time: string[], course2Time: string[]) {
		// console.log(course1Time, this.organizeTime(course1Time), "Ok");

		let course1TimeOrganized = this.organizeTime(course1Time);
		let course2TimeOrganized = this.organizeTime(course2Time);
		// console.log(
		// 	course1StartTime,
		// 	course1EndTime,
		// 	course2StartTime,
		// 	course2EndTime
		// );
		for (let i = 0; i < course1TimeOrganized.length; i++) {
			for (let j = 0; j < course2TimeOrganized.length; j++) {
				if (
					this.checkTimeConflictByPairs(
						course1TimeOrganized[i],
						course2TimeOrganized[j]
					)
				) {
					return true;
				}
			}
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
			(course1StartDate <= course2StartDate &&
				course2StartDate <= course1EndDate) ||
			(course1StartDate <= course2EndDate &&
				course2EndDate <= course1EndDate)
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
		// console.log(dateConflict, timeConflict);
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
			// console.log(conflict, day);
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
		return finalCombinations;
	}
	private toTitleCase(str: string) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	}
	public search(query: string) {
		const courses = this.getSemActive();
		const results: { course: Course; score: number }[] = [];
		for (let course of courses) {
			let score = 0;

			// Match score based on different criteria
			if (course.Code.replace(" ", "").includes(query.toUpperCase())) {
				score += 5; // Code match has higher weight
			}
			if (course.Description.includes(query)) {
				score += 3;
			}
			if (course.Faculties.join(" ").includes(this.toTitleCase(query))) {
				score += 2;
			}
			if (course.Name.includes(this.toTitleCase(query))) {
				score += 4;
			}

			// Push the course along with its score to the results array
			if (score > 0) {
				results.push({ course, score });
			}
		}
		results.sort((a, b) => b.score - a.score);

		// Extract only the course objects from the sorted results
		const sortedCourses = results.map((result) => result.course);

		return sortedCourses;
	}
	public getScheduleFromCodeAndSection(codeNSec: string): string[] {
		const [code, sec] = codeNSec.split("-");
		const course = this.getActiveSemCourseByCode(code);
		const section = course?.Sections[sec];

		const days = Object.keys(section!);
		const times = days.map((day) => section![day][0]);

		// console.log(times);
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
		// console.log(formattedResult);
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
		return this.sortWeekdays(days);
	}
	private sortWeekdays(weekdays: string[]): string[] {
		const daysInOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		weekdays.sort(
			(a, b) => daysInOrder.indexOf(a) - daysInOrder.indexOf(b)
		);
		return weekdays;
	}

	public sumCredits(selected: string[]): number {
		let totalCredits = 0;
		for (let code of selected) {
			totalCredits += Number(
				this.getActiveSemCourseByCode(code)!.Credits
			);
		}
		return totalCredits;
	}
}

export default CourseDirectory;
