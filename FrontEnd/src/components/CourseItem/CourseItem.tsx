import React, { useState } from "react";
import { Course } from "../../Course_Directory";
import "./CourseItem.css";
// @ts-ignore
import RadioUncheckedIcon from "./radio_button_unchecked.png";
// @ts-ignore
import CheckIcon from "./check.png";
import { useCookies } from "react-cookie";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

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
	const [cookies] = useCookies(["email"]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown toggle

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
			className={`course-item ${props.selected.includes(props.course.Code) ? "selected" : ""
				}`}
		>
			{/* Selection Indicator */}
			{!props.selected.includes(props.course.Code) ? (
				<img
					className="check-icon"
					src={RadioUncheckedIcon}
					alt="unchecked"
				/>
			) : (
				<img className="check-icon" src={CheckIcon} alt="unchecked" />
			)}

			{/* Course Details */}
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
			{props.course.Prerequisite && (
				<div className="field-wrapper">
					<span className="key">
						<strong>Prerequisites: </strong>
					</span>
					<span className="value">{props.course.Prerequisite}</span>
				</div>
			)}
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

			{/* Sections Dropdown */}
			<div className="field-wrapper sections">
				<div
					className={`dropdown-header ${isDropdownOpen ? "expanded" : ""}`}
					onClick={(e) => {
						e.stopPropagation(); // Prevent triggering the parent click
						setIsDropdownOpen(!isDropdownOpen);
					}}
				>
					<div className="dropdown-head">
						<span className="key">
							<strong>Sections:</strong>{" "}
							{Object.keys(props.course.Sections).join(", ")}
						</span>
						<span className="dropdown-arrow">
							{isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
						</span>
					</div>
				</div>


				{isDropdownOpen && (
					<div className="value sections-value">
						{Object.entries(props.course.Sections).map(([section, days], index, array) => (
							<div key={section} className="section-details">
								<strong>Section {section}:</strong>
								{Object.entries(days).map(([day, details]) => {
									const [times, dates] = details;
									return (
										<div key={day} className="day-details">
											<strong>{day}:</strong>
											<div>
												<em>Time: </em>
												{times
													.map(
														(time, i) =>
															i % 2 === 0 &&
															`${time} - ${times[i + 1]}`
													)
													.filter(Boolean) // Remove undefined values
													.join(", ")}
											</div>
											<div>
												<em>Dates: </em>
												{dates
													.map(
														(date, i) =>
															i % 2 === 0 &&
															`${date} - ${dates[i + 1]}`
													)
													.filter(Boolean) // Remove undefined values
													.join(", ")}
											</div>
										</div>
									);
								})}
								{/* Render <hr /> only if it's not the last section */}
								{index < array.length - 1 && <hr />}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Bi-Semester Info */}
			{props.course.isBiSem && (
				<div className="field-wrapper">
					<span className="key">
						<strong>Bi-Sem: </strong>
					</span>
					<span className="value">True</span>
				</div>
			)}
		</div>
	);
}
