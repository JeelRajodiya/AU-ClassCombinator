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
			<span>{props.combinations.length} Combinations</span>
			<span>{props.cd.sumCredits(props.selected)} Credits</span>

			<button
				onClick={() => {
					props.setSelected([]);
				}}
			>
				Clear All
			</button>
			<button
				onClick={() => {
					props.setIsCombinatorOpen(!props.isCombinatorOpen);
				}}
			>
				Go
			</button>
		</div>
	);
}
