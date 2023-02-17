import React from "react";
import { Course } from "./../Course_Directory";
import "./../styles/courseItem.css";
export default function CourseItem(props: { course: Course }) {
	return (
		<div className="course-item">
			<div className="code">Code : {props.course.Code}</div>
			<div className="name">Name : {props.course.Name}</div>
			<div className="credits">Credits : {props.course.Credits}</div>
			<div className="prereq">
				Prerequisite : {props.course.Prerequisite}
			</div>
			<div className="description">
				Description : {props.course.Description}
			</div>
			<div className="semester">Semester : {props.course.Semester}</div>
			<div className="faculty">
				Faculties: {props.course.Faculties.join(", ")}
			</div>
		</div>
	);
}
