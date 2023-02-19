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
export default function App() {
	const [cd, setCD] = React.useState(new CourseDirectory(winter, monsoon));
	const [query, setQuery] = React.useState("ENR");
	const [selected, setSelected] = React.useState<string[]>([]);

	return (
		<main>
			<SearchBar query={query} setQuery={setQuery}></SearchBar>
			<SemesterSwitch cd={cd} setCD={setCD} />
			<CourseExplorer
				selected={selected}
				setSelected={setSelected}
				query={query}
				cd={cd}
			/>
			<ActionBar selected={selected} setSelected={setSelected} />
		</main>
	);
}
