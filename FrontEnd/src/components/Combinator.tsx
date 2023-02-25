import React from "react";
import CourseDirectory from "./../Course_Directory";
import "./../styles/combinator.css";
type CombinatorProps = {
	cd: CourseDirectory;
	combinations: string[][];
};

export default function Combinator(props: CombinatorProps) {
	return (
		<div className="combinator">
			<h1>Combinator</h1>
			{props.combinations.map((combination) => (
				<div className="combination-entry-wrapper">
					<div className="combination-entry">
						{combination.map((code) => (
							<div className="combinator-course">
								<span className="combinator-code">{code}</span>
								<div className="combinator-schedule">
									{props.cd
										.getScheduleFromCodeAndSection(code)
										.map((e) => (
											<div>{e}</div>
										))}
								</div>
							</div>
						))}
					</div>
					<div className="days-to-go">
						Active Days:{" "}
						{props.cd.getUsedDays(combination).join(", ")}
						<div>
							{7 - props.cd.getUsedDays(combination).length}{" "}
							holidays in a week
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
