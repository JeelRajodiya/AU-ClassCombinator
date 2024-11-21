import React from "react";
import "./SelectedCourses.css";
import { IoCloseSharp } from "react-icons/io5";


type SelectedCoursesProps = {
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>; // Add this to modify the selected courses
};

export default function SelectedCourses({ selected, setSelected }: SelectedCoursesProps) {
	// Function to handle course removal
	const removeCourse = (courseToRemove: string) => {
		// Filter out the course that is to be removed from the selected array
		setSelected((prevSelected) =>
			prevSelected.filter((course) => course !== courseToRemove)
		);
	};

	return (
		<div className="selected-courses-tag-wrapper">
			{selected.map((course, index) => (
				<div key={index} className="selected-course-tag">
					{course}
					{/* Remove button */}
					<button
						className="remove-btn"
						onClick={() => removeCourse(course)}
					>
						{React.createElement(IoCloseSharp)}
					</button>
				</div>
			))}
		</div>
	);
}
