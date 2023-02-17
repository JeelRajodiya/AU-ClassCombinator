import * as React from "react";
import "../styles/searchBar.css";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar() {
	return (
		<div id="searchBar-container">
			<input placeholder="ENR100"></input>
			<div id="search-icon">
				<SearchIcon style={{ color: "#204074" }} />
			</div>
		</div>
	);
}
