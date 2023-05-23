import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import Login from "./components/Login/Login";
import ReactDOM from "react-dom/client";
import "./global.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
const router = createBrowserRouter([
	{
		path: "/Home",
		element: <App />,
	},
	{
		path: "/",
		element: <Login />,
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
