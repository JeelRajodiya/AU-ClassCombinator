import React from "react";
import "./../styles/actionBar.css";

type ActionBarProps = {
	selected: string[];
	setSelected: any;
};

export default function ActionBar(props: ActionBarProps) {
	return (
		<div className="action-bar">
			{props.selected.length} Courses Selected
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
