import React from "react";
import CourseDirectory from "../Course_Directory";
import CourseItem from "./CourseItem";
import winter from "../Data/winter.json";
import monsoon from "../Data/monsoon.json";

export default function CourseExplorer(props: {
	query: string;
	cd: CourseDirectory;
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
	// const cd = new CourseDirectory(winter, monsoon);
	const courses = props.cd.search(props.query);

	return (
		<div
			className="course-explorer"
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
					key={course.Code}
					course={course}
				></CourseItem>
			))}
		</div>
	);
}
