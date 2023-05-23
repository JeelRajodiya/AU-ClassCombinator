import React from "react";
import CourseDirectory from "../../Course_Directory";
import CourseItem from "../CourseItem/CourseItem";
import type { Course } from "../../Course_Directory";

export default function CourseExplorer(props: {
	query: string;
	cd: CourseDirectory;
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
	// const cd = new CourseDirectory(winter, monsoon);
	let courses: Course[];
	if (props.query === "") {
		courses = [];
	} else {
		courses = props.cd.search(props.query.trim());
	}

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				flexDirection: "column",
			}}
		>
			{courses.map((course) => (
				<CourseItem
					selected={props.selected}
					setSelected={props.setSelected}
					key={course.Code + course.Credits}
					course={course}
				></CourseItem>
			))}
		</div>
	);
}
