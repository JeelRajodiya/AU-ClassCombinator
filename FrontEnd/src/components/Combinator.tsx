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
		for (let i = 0; i < inputArray.length; i++) {
			inputArray[i] = inputArray[i].filter((e) => e !== "");
		}

		let outputObject: { [key: string]: Array<string> } = {};
		for (let i = 0; i < inputArray.length; i++) {
			if (outputObject.hasOwnProperty(inputArray[i][0])) {
				outputObject[inputArray[i][0]] = outputObject[
					inputArray[i][0]
				].concat(inputArray[i].slice(1));
			} else {
				outputObject[inputArray[i][0]] = inputArray[i].slice(1);
			}
		}
		for (let key in outputObject) {
			outputObject[key] = outputObject[key].sort((a, b) => {
				return Number(a.split(":")[0]) - Number(b.split(":")[0]);
			});
		}
		return outputObject;
	}
	function processTimetable(timeTable: string[][]) {
		timeTables = [];
		return transformArrayToObject(timeTable);
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
						<TimeTable timeTable={processTimetable(timeTables)} />

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
