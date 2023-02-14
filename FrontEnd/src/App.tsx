import * as React from "react";
import Button from "@mui/material/Button";
import CourseDirectory from "./Course_Directory";
import winter from "./Data/winter.json";
import monsoon from "./Data/monsoon.json";

export default function App() {
	const cd = new CourseDirectory(winter, monsoon);
	console.log(
		cd.generatePossibleCombinations(["CSE108", "ENR100", "ENR102"])
	);

	return <>ok</>;
}
