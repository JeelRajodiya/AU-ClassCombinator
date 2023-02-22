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
	console.log(cd.getScheduleFromCodeAndSection("ENR100-1"));
	const [selected, setSelected] = React.useState<string[]>([]);
	const [combinations, setCombinations] = React.useState<string[][]>([]);
	React.useEffect(() => {
		setCombinations(cd.generatePossibleCombinations(selected));
	}, [selected]);
	const [isCombinatorOpen, setIsCombinatorOpen] = React.useState(false);

	return (
		<main>
			{isCombinatorOpen ? (
				<Combinator cd={cd} combinations={combinations} />
			) : (
				<>
					<SearchBar query={query} setQuery={setQuery}></SearchBar>
					<SemesterSwitch cd={cd} setCD={setCD} />
					<CourseExplorer
						selected={selected}
						setSelected={setSelected}
						query={query}
						cd={cd}
					/>
				</>
			)}

			<ActionBar
				selected={selected}
				combinations={combinations}
				setSelected={setSelected}
				isCombinatorOpen={isCombinatorOpen}
				setIsCombinatorOpen={setIsCombinatorOpen}
			/>
		</main>
	);
}
