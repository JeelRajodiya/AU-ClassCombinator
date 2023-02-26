import * as React from "react";
import { TextField } from "@mui/material";
import CourseDirectory from "./Course_Directory";
import winter from "./Data/winter.json";
import monsoon from "./Data/monsoon.json";
import SearchBar from "./components/SearchBar";
import "./styles/app.css";
import CourseExplorer from "./components/CourseExplorer";
import SemesterSwitch from "./components/SemesterSwitch";
import ActionBar from "./components/ActionBar";
import Combinator from "./components/Combinator";
export default function App() {
	const [cd, setCD] = React.useState(new CourseDirectory(winter, monsoon));
	const [query, setQuery] = React.useState("ENR");
	// console.log(cd.getScheduleFromCodeAndSection("ENR100-1"));
	const [selected, setSelected] = React.useState<string[]>([]);
	const [combinations, setCombinations] = React.useState<string[][]>([]);
	React.useEffect(() => {
		setCombinations(cd.generatePossibleCombinations(selected));
	}, [selected]);
	const [isCombinatorOpen, setIsCombinatorOpen] = React.useState(false);

	return (
		<main>
			<meta
				name="viewport"
				content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
			/>
			{isCombinatorOpen ? (
				<Combinator cd={cd} combinations={combinations} />
			) : (
				<>
					<SearchBar query={query} setQuery={setQuery}></SearchBar>
					<SemesterSwitch
						query={query}
						setQuery={setQuery}
						cd={cd}
						setCD={setCD}
						setSelected={setSelected}
					/>
					<CourseExplorer
						selected={selected}
						setSelected={setSelected}
						query={query}
						cd={cd}
					/>
				</>
			)}

			<ActionBar
				cd={cd}
				selected={selected}
				combinations={combinations}
				setSelected={setSelected}
				isCombinatorOpen={isCombinatorOpen}
				setIsCombinatorOpen={setIsCombinatorOpen}
			/>
		</main>
	);
}
