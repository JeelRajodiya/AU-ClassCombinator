import React from "react";
import CourseDirectory from "../../Course_Directory";
import "./ActionBar.css";

type ActionBarProps = {
	selected: string[];
	setSelected: React.Dispatch<React.SetStateAction<string[]>>;
	combinations: string[][];
	isCombinatorOpen: boolean;
	setIsCombinatorOpen: React.Dispatch<React.SetStateAction<boolean>>;
	cd: CourseDirectory;
};

export default function ActionBar(props: ActionBarProps) {
	let [clearAllCount, setClearAllCount] = React.useState(0);
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
				className={`${clearAllCount > 0 ? "red" : ""} action-bar-btn`}
				onClick={() => {
					if (clearAllCount < 1) {
						setClearAllCount((e) => e + 1);
					} else {
						setClearAllCount(0);
						props.setSelected([]);
					}
				}}
				disabled={props.isCombinatorOpen || props.selected.length === 0}
			>
				{clearAllCount < 1 ? "Clear All" : "Sure?"}
			</button>
			<button
				className={`action-bar-btn go-btn ${
					props.selected.length === 0 ||
					props.combinations.length === 0
						? "disabled"
						: "enabled"
				}`}
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
