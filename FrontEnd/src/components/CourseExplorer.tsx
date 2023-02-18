import React from "react";
import CourseDirectory from "../Course_Directory";
import CourseItem from "./CourseItem";
import winter from "../Data/winter.json";
import monsoon from "../Data/monsoon.json";

export default function CourseExplorer(props: {
	query: string;
	cd: CourseDirectory;
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
				<CourseItem key={course.Code} course={course}></CourseItem>
			))}
		</div>
	);
}
