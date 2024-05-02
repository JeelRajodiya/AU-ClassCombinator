import React from "react";
import CourseDirectory from "../../Course_Directory";

import "./SemesterSwitch.css";
export default function SemesterSwitch(props: {
	cd: CourseDirectory;
	setCD: any;
	query: string;
	setQuery: any;
	setSelected: any;
}) {
	return (
		<div className="semester-switch">
			{/* selection of monsoon and winter */}
			<select
				className="semester-select"
				value={props.cd.activeSemName}
				onChange={(e) => {
					if (e.target.value === "Winter") {
						props.cd.changeActiveSemToWinter();
					} else {
						props.cd.changeActiveSemToMonsoon();
					}
					props.setCD(props.cd);
					props.setSelected([]);
					props.setQuery(props.query + " ");
					setTimeout(() => props.setQuery(props.query), 100);
				}}
			>
				<option value="Winter">Winter 2024</option>
				<option value="Monsoon">Monsoon 2024</option>
			</select>
		</div>
	);
}
