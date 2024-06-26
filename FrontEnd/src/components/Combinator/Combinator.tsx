import React from "react";
import CourseDirectory from "../../Course_Directory";
import "./Combinator.css";
import Table from "../Table/Table";
import { TimetableData } from "../Table/Table";
type CombinatorProps = {
	cd: CourseDirectory;
	combinations: string[][];
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
};

function SelectedCoursesCard({
	parentProps,
	code,
}: {
	parentProps: CombinatorProps;
	code: string;
}) {
	return (
		<div
			className="selected-course-card"
			key={String(Math.random() * 1000)}
		>
			<span className="combinator-code">{code}</span>
			<span>{parentProps.cd.getActiveSemCourseByCode(code)!.Name}</span>
			<button
				disabled={parentProps.selected.length <= 1}
				onClick={() => {
					if (parentProps.selected.length > 1) {
						parentProps.setSelected(
							parentProps.selected.filter((e) => e !== code)
						);
					}
				}}
				className="delete-selected-button"
			>
				Remove
			</button>
		</div>
	);
}

function CombinationDetails(props: {
	cd: CourseDirectory;
	combination: string[];
}) {
	return (
		<div className="days-to-go">
			Active Days:{" "}
			<u>{props.cd.getUsedDays(props.combination).join(", ")}</u>
			<div>
				<u>{7 - props.cd.getUsedDays(props.combination).length}</u>{" "}
				holidays in a week
			</div>
		</div>
	);
}
function getEmptyTable() {
	return {
		Mon: [],
		Tue: [],
		Wed: [],
		Thu: [],
		Fri: [],
		Sat: [],
		Sun: [],
	};
}
export default function Combinator(props: CombinatorProps) {
	let combinationCount = 0;

	let unprocessedTable = getEmptyTable();
	function processTable(unprocessedTable: any): TimetableData {
		// unprocessed has Mon = [{course:"CSE105",time:["9:00-10:00","10:00-11:00"]},{course:"CSE105",time:["9:00-10:00","10:00-11:00"]}]
		// processed has Mon = [{course:"CSE105",time:"9:00-10:00"},{course:"CSE105",time:"10:00-11:00"}]
		let processedTable: any = getEmptyTable();
		for (let day in unprocessedTable) {
			for (let i = 0; i < unprocessedTable[day].length; i++) {
				for (let j = 0; j < unprocessedTable[day][i].time.length; j++) {
					if (unprocessedTable[day][i].time[j] === "") {
						continue;
					}
					processedTable[day].push({
						course: unprocessedTable[day][i].course,
						time: unprocessedTable[day][i].time[j],
					});
				}
			}
		}
		// empty the unprocessed table
		for (let day in unprocessedTable) {
			unprocessedTable[day] = [];
		}
		return processedTable;
	}

	return (
		<div className="combinator">
			<div className="combination-entry-wrapper selection">
				<strong>Selected Courses</strong>

				<div className="selected-courses-wrapper">
					{props.selected.map((code) => (
						<SelectedCoursesCard parentProps={props} code={code} />
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
											let dayNTime = e.split(/[ ,]+/);
											let day = dayNTime[0];
											let time = dayNTime.slice(1);
											//@ts-ignore
											unprocessedTable[day].push({
												time,
												course: code,
											});

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
						<div className="schedule-title">Schedule</div>
						<Table timetable={processTable(unprocessedTable)} />
						<CombinationDetails
							cd={props.cd}
							combination={combination}
						/>
					</div>
				</div>
			))}
		</div>
	);
}
