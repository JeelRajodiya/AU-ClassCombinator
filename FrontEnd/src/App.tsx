import * as React from "react";
import Button from "@mui/material/Button";
import CourseDirectory from "./Course_Directory";
import winter from "./Data/winter.json";
import monsoon from "./Data/monsoon.json";

export default function App() {
	const cd = new CourseDirectory(winter, monsoon);
	console.log(
		cd.generatePossibleCombinations([
			"ENR102",
			"COM102",
			"ENR100",
			"FDP101",
		])
	);

	return <>ok</>;
}
