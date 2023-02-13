import fs from "fs";

class CourseDirectory {
	private winter: any;
	constructor() {
		this.winter = JSON.parse(fs.readdirSync("./Data/winter.json"));
	}
	public getWinter() {
		return this.winter;
	}
}
