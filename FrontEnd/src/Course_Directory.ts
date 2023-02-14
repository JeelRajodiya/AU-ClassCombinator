// import * as fs from "fs";
import loadsh from "lodash";

class CourseDirectory {
	private winter: any;
	private monsoon: any;
	private activeSem: any;

	constructor(winter: any, monsoon: any) {
		this.winter = winter;
		this.monsoon = monsoon;
		this.activeSem = this.winter;
	}
	public getSemActive() {
		return this.activeSem;
	}
	public changeActiveSemToWinter() {
		this.activeSem = this.winter;
	}
	public changeActiveSemToMonsoon() {
		this.activeSem = this.monsoon;
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
		console.log(date);
		return new Date(year, month, day);
	}
	private checkForTimeConflict(course1Time: string[], course2Time: string[]) {
		let course1StartTime = this.strToTime(course1Time[0]);
		let course1EndTime = this.strToTime(course1Time[1]);
		let course2StartTime = this.strToTime(course2Time[0]);
		let course2EndTime = this.strToTime(course2Time[1]);
		if (
			(course1StartTime <= course2StartTime &&
				course2StartTime <= course1EndTime) ||
			(course1StartTime <= course2EndTime &&
				course2EndTime <= course1EndTime)
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
		console.log(
			course1StartDate,
			course1EndDate,
			course2StartDate,
			course2EndDate
		);
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
		const sectionObj = course.Sections[sectionStr];

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
		console.log(timeConflict, dateConflict);
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
		for (let day of Object.keys(course1Data)) {
			if (course2Data.hasOwnProperty(day)) {
				sameDays.push(day);
			}
		}
		if (sameDays.length === 0) {
			return false;
		}
		for (let day of sameDays) {
			const course1Day = course1Data[day];
			const course2Day = course2Data[day];
			const conflict = this.checkForDayConflict(course1Day, course2Day);
			if (conflict) {
				return true;
			}
		}

		return false;
	}
}

export default CourseDirectory;
