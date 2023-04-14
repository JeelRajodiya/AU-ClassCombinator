import { padding } from "@mui/system";
import React from "react";
import CourseDirectory from "./../Course_Directory";
import "./../styles/combinator.css";
type CombinatorProps = {
	cd: CourseDirectory;
	combinations: string[][];
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function Combinator(props: CombinatorProps) {
	return (
		<div className="combinator">
			<h1>Combinator</h1>
			<div className="combination-entry-wrapper selection">
				<h4>
					<u>Selected Courses</u>
				</h4>
				<div className="selected-courses-wrapper">
					{props.selected.map((code) => (
						<div
							className="selected-course-card"
							key={String(Math.random() * 1000)}
						>
							<span className="combinator-code">{code}</span>
							<span>
								{props.cd.getActiveSemCourseByCode(code)!.Name}
							</span>
							<button
								disabled={props.selected.length <= 1}
								onClick={() => {
									if (props.selected.length > 1) {
										props.setSelected(
											props.selected.filter(
												(e) => e !== code
											)
										);
									}
								}}
								className="delete-selected-button"
							>
								Delete
							</button>
						</div>
					))}
				</div>
			</div>
			{props.combinations.map((combination) => (
				<div
					className="combination-entry-wrapper"
					key={String(Math.random() * 1000)}
				>
					<div className="combination-entry">
						{combination.map((code) => (
							<div
								className="combinator-course"
								key={String(Math.random() * 1000)}
							>
								<span className="combinator-code">{code}</span>
								<div className="combinator-schedule">
									{props.cd
										.getScheduleFromCodeAndSection(code)
										.map((e) => (
											<div
												key={String(
													Math.random() * 1000
												)}
											>
												{e}
											</div>
										))}
								</div>
							</div>
						))}
					</div>
					<div className="days-to-go">
						Active Days:{" "}
						<u>{props.cd.getUsedDays(combination).join(", ")}</u>
						<div>
							<u>
								{7 - props.cd.getUsedDays(combination).length}
							</u>{" "}
							holidays in a week
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
