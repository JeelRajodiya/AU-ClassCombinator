import React from "react";
import CourseDirectory from "./../Course_Directory";
import "./../styles/actionBar.css";

type ActionBarProps = {
	selected: string[];
	setSelected: any;
	combinations: string[][];
	isCombinatorOpen: boolean;
	setIsCombinatorOpen: any;
	cd: CourseDirectory;
};

export default function ActionBar(props: ActionBarProps) {
	return (
		<div className="action-bar">
			<span>{props.selected.length} Selected</span>
			<span
				style={{
					color: props.combinations.length === 0 ? "red" : "black",
				}}
			>
				{props.combinations.length} Combinations
			</span>
			<span>
				<span className="credits">
					{props.cd.sumCredits(props.selected)}
				</span>{" "}
				Credits
			</span>

			<button
				onClick={() => {
					props.setSelected([]);
				}}
				disabled={props.isCombinatorOpen || props.selected.length === 0}
			>
				Clear All
			</button>
			<button
				onClick={() => {
					props.setIsCombinatorOpen(!props.isCombinatorOpen);
				}}
				disabled={
					props.selected.length === 0 ||
					props.combinations.length === 0
				}
			>
				{!props.isCombinatorOpen ? "Go" : "Back"}
			</button>
		</div>
	);
}
