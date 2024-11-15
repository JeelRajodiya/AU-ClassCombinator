import * as React from "react";
import { TextField } from "@mui/material";
import CourseDirectory from "./Course_Directory";
import winter from "./Data/winter.json";
import monsoon from "./Data/monsoon.json";
import SearchBar from "./components/SearchBar/SearchBar";
import "./App.css";
import CourseExplorer from "./components/CourseExplorer/CourseExplorer";
import SemesterSwitch from "./components/SemesterSwitch/SemesterSwitch";
import ActionBar from "./components/ActionBar/ActionBar";
import Combinator from "./components/Combinator/Combinator";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
	const [cd, setCD] = React.useState(new CourseDirectory(winter, monsoon));
	const [query, setQuery] = React.useState("");
	// console.log(cd.getScheduleFromCodeAndSection("ENR100-1"));
	const [selected, setSelected] = React.useState<string[]>([]);
	React.useEffect(() => {
		localStorage.getItem("selected") &&
			setSelected(JSON.parse(localStorage.getItem("selected")!));
	}, []);
	const [combinations, setCombinations] = React.useState<string[][]>([]);
	React.useEffect(() => {
		setCombinations(cd.generatePossibleCombinations(selected));
		localStorage.setItem("selected", JSON.stringify(selected));
	}, [selected]);

	const [isCombinatorOpen, setIsCombinatorOpen] = React.useState(false);

	return (
		<main>
			<meta
				name="viewport"
				content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
			/>

			<Analytics />
			<span className="update-status">
				Updated on 9th May 2024
				<span style={{ color: "red" }}>
					{" "}
					The project is no longer maintained.
				</span>
			</span>
			{isCombinatorOpen ? (
				<Combinator
					cd={cd}
					selected={selected}
					setSelected={setSelected}
					combinations={combinations}
				/>
			) : (
				<>
					<div
						className={`searching-elements ${
							query === "" ? "default-height" : "expended"
						}`}
					>
						<h1 className="title">Class Combinator</h1>
						<SearchBar
							query={query}
							setQuery={setQuery}
						></SearchBar>
						<SemesterSwitch
							query={query}
							setQuery={setQuery}
							cd={cd}
							setCD={setCD}
							setSelected={setSelected}
						/>
					</div>
					<div
						className={` ${
							query === "" ? "default-height" : "expended"
						} course-explorer-wrapper`}
					>
						<CourseExplorer
							selected={selected}
							setSelected={setSelected}
							query={query}
							cd={cd}
						/>
					</div>
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
