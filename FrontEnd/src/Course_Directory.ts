// import * as fs from "fs";

class CourseDirectory {
	private winter: any;
	constructor(winter: any, monsoon: any) {
		this.winter = winter;
		this.monsoon = monsoon;
	}
	public getWinter() {
		return this.winter;
	}
}

export default CourseDirectory;
