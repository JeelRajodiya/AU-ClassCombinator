import React, { useLayoutEffect, useRef } from "react";
import "../styles/table.css";

interface TimetableItem {
	time: string;
	course: string;
}

export interface TimetableData {
	[day: string]: TimetableItem[];
}

const Table: React.FC<{ timetable: TimetableData }> = (props) => {
	const { timetable } = props;

	const ref = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		if (ref.current) {
			document.documentElement.style.setProperty(
				"--lineWidth",
				`${ref.current.scrollWidth - 60}px`
			);
		}
	}, []);

	const edges: string[] = [];
	const courses: string[] = [];
	const colours: string[] = [
		"#fe744c",
		"#0b246a",
		"#3c8dfd",
		"#1E8449",
		"#edbb30",
		"#CB4335",
		"#273746",
		"#0E6655",
		"#7D3C98",
		"#F39C12",
	];
	const divs: {
		className: string;
		data: string;
		row: number;
		col: number;
		row1: number;
		col1: number;
		backgroundColor?: string;
	}[] = [
		{ className: "", data: "", row: 1, col: 1, row1: 2, col1: 2 },
		{ className: "days", data: "Mon", row: 1, col: 2, row1: 2, col1: 3 },
		{ className: "days", data: "Tue", row: 1, col: 3, row1: 2, col1: 4 },
		{ className: "days", data: "Wed", row: 1, col: 4, row1: 2, col1: 5 },
		{ className: "days", data: "Thu", row: 1, col: 5, row1: 2, col1: 6 },
		{ className: "days", data: "Fri", row: 1, col: 6, row1: 2, col1: 7 },
		{ className: "days", data: "Sat", row: 1, col: 7, row1: 2, col1: 8 },
		{ className: "days", data: "Sun", row: 1, col: 8, row1: 2, col1: 9 },
	];

	const coursesToColour: { [course: string]: string } = {};

	for (const key in timetable) {
		timetable[key].forEach((item) => {
			edges.push(item.time.split("-")[0]);
			edges.push(item.time.split("-")[1]);
			courses.push(item.course);
		});
	}

	const uniqueEdges = [...new Set(edges)];
	uniqueEdges.sort();
	const uniqueCourses = [...new Set(courses)];

	uniqueCourses.forEach((course, i) => {
		if (i >= colours.length) {
			coursesToColour[course] = colours[i - colours.length];
		} else {
			coursesToColour[course] = colours[i];
		}
	});

	uniqueEdges.forEach((edge, i) => {
		divs.push({
			className: "time",
			data: edge,
			row: i + 2,
			col: 1,
			row1: i + 3,
			col1: 2,
		});
	});

	let colIndex = 2;
	for (const key in timetable) {
		timetable[key].forEach((item) => {
			const temprow1 = uniqueEdges.indexOf(item.time.split("-")[0]);
			const temprow2 = uniqueEdges.indexOf(item.time.split("-")[1]);
			divs.push({
				className: "grid-item",
				data: item.course,
				row: temprow1 + 2,
				col: colIndex,
				row1: temprow2 + 2,
				col1: colIndex + 1,
				backgroundColor: coursesToColour[item.course],
			});
		});
		colIndex++;
	}

	return (
		<div className="container-main">
			<div
				ref={ref}
				className="container-grid"
				style={{
					gridTemplateRows: `25px repeat(${uniqueEdges.length},1fr)`,
				}}
			>
				{divs.map((div, index) => (
					<div
						key={index}
						className={div.className}
						style={{
							gridArea: `${div.row}/${div.col}/${div.row1}/${div.col1}`,
							backgroundColor: div.backgroundColor,
						}}
					>
						{div.data}
					</div>
				))}
			</div>
		</div>
	);
};

export default Table;
