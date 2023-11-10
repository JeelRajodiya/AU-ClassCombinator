import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Login from "./components/Login/Login";
import ReactDOM from "react-dom/client";
import "./global.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Banned from "./components/Banned/Banned";
const router = createBrowserRouter([
	{
		path: "/Home",
		element: <App />,
	},
	{
		path: "/",
		element: <Login />,
	},
	{
		path: "/Banned",
		element: <Banned />,
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
