import React from "react";
import { Course } from "../../Course_Directory";
import "./CourseItem.css";
// @ts-ignore
import RadioUncheckedIcon from "./radio_button_unchecked.png";
// @ts-ignore
import CheckIcon from "./check.png";
import { useCookies } from "react-cookie";

async function search(email: string, query: string) {
	const res = await fetch("https://classcombinator2.vercel.app/api/search", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},

		body: JSON.stringify({
			email: email,
			query: query,
		}),
	});
}

export default function CourseItem(props: {
	course: Course;
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
	const [cookies, setCookie, removeCookie] = useCookies(["email"]);

	return (
		<div
			onClick={() => {
				if (props.selected.includes(props.course.Code)) {
					props.setSelected(
						props.selected.filter(
							(code) => code !== props.course.Code
						)
					);
				} else {
					props.setSelected([...props.selected, props.course.Code]);
					search(cookies.email, props.course.Code);
				}
			}}
			className={`course-item  ${
				props.selected.includes(props.course.Code) ? "selected" : ""
			} `}
		>
			{!props.selected.includes(props.course.Code) ? (
				<img
					className="check-icon"
					src={RadioUncheckedIcon}
					alt="unchecked"
				/>
			) : (
				<img className="check-icon" src={CheckIcon} alt="unchecked" />
			)}
			<div className="field-wrapper">
				<span className="key">
					<strong>Code: </strong>
				</span>
				<span className="value code">{props.course.Code}</span>
			</div>
			<div className="field-wrapper">
				<span className="key">
					<strong>Name: </strong>
				</span>
				<span className="value">{props.course.Name}</span>
			</div>
			<div className="field-wrapper">
				<span className="key">
					<strong>Credits: </strong>
				</span>
				<span className="value credits">{props.course.Credits}</span>
			</div>
			{props.course.Prerequisite ? (
				<div className="field-wrapper">
					<span className="key">
						<strong>Prerequisites: </strong>
					</span>
					<span className="value">{props.course.Prerequisite}</span>
				</div>
			) : null}
			<div className="field-wrapper">
				<span className="key">
					<strong>Faculties: </strong>
				</span>
				<span className="value">
					{props.course.Faculties.join(", ")}
				</span>
			</div>
			<div className="field-wrapper">
				<span className="key">
					<strong>Semester: </strong>
				</span>
				<span className="value">{props.course.Semester}</span>
			</div>
			{props.course.isBiSem ? (
				<div className="field-wrapper">
					<span className="key">
						<strong>Bi-Sem: </strong>
					</span>
					<span className="value">True</span>
				</div>
			) : (
				""
			)}
		</div>
	);
}
