import React from "react";

type TimeTableProps = {
	timeTable: { [key: string]: Array<string> };
};

export default function TimeTable({ timeTable }: TimeTableProps) {
	const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	return (
		<table>
			<thead>
				<tr>
					<th>Day</th>
					<th>Time</th>
				</tr>
			</thead>
			<tbody>
				{daysOfWeek.map((day) => (
					<tr key={day}>
						<td>{day}</td>
						<td>
							{timeTable[day] ? timeTable[day].join(", ") : "-"}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}
