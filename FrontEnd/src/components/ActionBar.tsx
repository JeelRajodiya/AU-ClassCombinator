import React from "react";
import "./../styles/actionBar.css";

type ActionBarProps = {
	selected: string[];
	setSelected: any;
	combinations: string[][];
};

export default function ActionBar(props: ActionBarProps) {
	return (
		<div className="action-bar">
			<span>{props.selected.length} Courses Selected</span>
			{props.combinations.length} Combinations
			<button
				onClick={() => {
					props.setSelected([]);
				}}
			>
				Clear All
			</button>
			<button>Go</button>
		</div>
	);
}
