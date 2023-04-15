import { padding } from "@mui/system";
import React from "react";
import CourseDirectory from "./../Course_Directory";
import "./../styles/combinator.css";
import TimeTable from "./TimeTable";
type CombinatorProps = {
	cd: CourseDirectory;
	combinations: string[][];
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
};

export default function Combinator(props: CombinatorProps) {
	let combinationCount = 0;
	let timeTables: string[][] = [];
	function transformArrayToObject(inputArray: Array<Array<string>>): {
		[key: string]: Array<string>;
	} {
		const outputObject: { [key: string]: Array<string> } = {};

		inputArray.forEach((item) => {
			const [day, time] = item;
			if (outputObject[day]) {
				outputObject[day].push(time);
			} else {
				outputObject[day] = [time];
			}
		});
		// remove duplicates
		Object.keys(outputObject).forEach((key) => {
			outputObject[key] = outputObject[key].filter(
				(value, index, self) => self.indexOf(value) === index
			);
		});

		// sort, 8:00 should be before 13:00
		Object.keys(outputObject).forEach((key) => {
			outputObject[key] = outputObject[key].sort((a, b) => {
				const aTime = a.split(":");
				const bTime = b.split(":");
				if (aTime[0] === bTime[0]) {
					return parseInt(aTime[1]) - parseInt(bTime[1]);
				} else {
					return parseInt(aTime[0]) - parseInt(bTime[0]);
				}
			});
		});

		return outputObject;
	}

	return (
		<div className="combinator">
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
			<div className="line"></div>
			<h2>Combinations</h2>
			{props.combinations.map((combination) => (
				<div
					className="combination-entry-wrapper"
					key={String(Math.random() * 1000)}
				>
					<div> Combination {++combinationCount}</div>
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
										.map((e) => {
											timeTables.push(e.split(/[ ,]+/));
											return (
												<div
													key={String(
														Math.random() * 1000
													)}
												>
													{e}
												</div>
											);
										})}
								</div>
							</div>
						))}
					</div>
					<div className="time-table">
						<TimeTable
							timeTable={transformArrayToObject(timeTables)}
						/>
						<div className="days-to-go">
							Active Days:{" "}
							<u>
								{props.cd.getUsedDays(combination).join(", ")}
							</u>
							<div>
								<u>
									{7 -
										props.cd.getUsedDays(combination)
											.length}
								</u>{" "}
								holidays in a week
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
