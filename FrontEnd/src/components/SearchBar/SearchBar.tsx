import * as React from "react";
import "./SearchBar.css";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar(props: { 
	query: string; 
	setQuery: React.Dispatch<React.SetStateAction<string>>; 
}) {
	return (
		<div id="searchBar-container">
			<input
				placeholder="Search for courses ... "
				value={props.query}
				onChange={(e) => {
					props.setQuery(e.target.value);
				}}
			></input>
			<div id="search-icon">
				<SearchIcon style={{ color: "#204074" }} />
			</div>
		</div>
	);
}
