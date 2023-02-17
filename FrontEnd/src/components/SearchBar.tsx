import * as React from "react";
import "../styles/searchBar.css";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar(props: { query: string; setQuery: any }) {
	return (
		<div id="searchBar-container">
			<input
				placeholder="ENR100"
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
