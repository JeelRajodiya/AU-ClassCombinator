import React from "react";
import CourseDirectory from "../Course_Directory";
import { styled } from "@mui/material/styles";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch, { SwitchProps } from "@mui/material/Switch";
import "./../styles/semesterSwitch.css";
export default function SemesterSwitch(props: {
	cd: CourseDirectory;
	setCD: any;
}) {
	const [checked, setChecked] = React.useState(
		props.cd.activeSemName === "Monsoon" ? true : false
	);
	return (
		<div className="semester-switch">
			<span style={{ paddingRight: 12, fontSize: "1.1em" }}>winter</span>

			<FormControlLabel
				label="monsoon"
				onChange={() => {
					if (props.cd.activeSemName === "Winter") {
						props.cd.changeActiveSemToMonsoon();
						setChecked(true);
					} else {
						setChecked(false);
						props.cd.changeActiveSemToWinter();
					}
					props.setCD(props.cd);
				}}
				checked={checked}
				control={<IOSSwitch sx={{ mx: 2 }} defaultChecked />}
			/>
		</div>
	);
}

const IOSSwitch = styled((props: SwitchProps) => (
	<Switch
		focusVisibleClassName=".Mui-focusVisible"
		disableRipple
		{...props}
	/>
))(({ theme }) => ({
	width: 42,
	height: 26,
	padding: 0,
	"& .MuiSwitch-switchBase": {
		padding: 0,
		margin: 2,
		transitionDuration: "300ms",
		"&.Mui-checked": {
			transform: "translateX(16px)",
			color: "#fff",
			"& + .MuiSwitch-track": {
				backgroundColor:
					theme.palette.mode === "dark" ? "#2ECA45" : "orange",
				opacity: 1,
				border: 0,
			},
			"&.Mui-disabled + .MuiSwitch-track": {
				opacity: 0.5,
			},
		},
		"&.Mui-focusVisible .MuiSwitch-thumb": {
			color: "#33cf4d",
			border: "6px solid #fff",
		},
		"&.Mui-disabled .MuiSwitch-thumb": {
			color:
				theme.palette.mode === "light"
					? theme.palette.grey[100]
					: theme.palette.grey[600],
		},
		"&.Mui-disabled + .MuiSwitch-track": {
			opacity: theme.palette.mode === "light" ? 0.7 : 0.3,
		},
	},
	"& .MuiSwitch-thumb": {
		boxSizing: "border-box",
		width: 22,
		height: 22,
	},
	"& .MuiSwitch-track": {
		borderRadius: 26 / 2,
		backgroundColor: theme.palette.mode === "light" ? "cyan" : "#39393D",
		opacity: 1,
		transition: theme.transitions.create(["background-color"], {
			duration: 500,
		}),
	},
}));
