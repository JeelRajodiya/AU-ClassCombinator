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
				<div className="combination-entry">
					{combination.map((code) => (
						<span className="combinator-code">{code}</span>
					))}
				</div>
			))}
		</div>
	);
}
