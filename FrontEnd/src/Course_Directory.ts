// import * as fs from "fs";

class CourseDirectory {
	private winter: any;
	private monsoon: any;
	private activeSem: any;

	constructor(winter: any, monsoon: any) {
		this.winter = winter;
		this.monsoon = monsoon;
		this.activeSem = this.winter;
	}
	public getActive() {
		return this.activeSem;
	}
	public changeActiveToWinter() {
		this.activeSem = this.winter;
	}
	public changeActiveToMonsoon() {
		this.activeSem = this.monsoon;
	}
	public getWinter() {
		return this.winter;
	}
	public getMonsoon() {
		return this.monsoon;
	}
	public getActiveCourses() {
		let courses = [];
		for (let course of this.activeSem) {
			courses.push(course.Code);
		}
		return courses;
	}
	public getActiveCourse(courseCode: string) {
		for (let course of this.activeSem) {
			if (course.Code === courseCode) {
				return course;
			}
		}
	}
}

export default CourseDirectory;
