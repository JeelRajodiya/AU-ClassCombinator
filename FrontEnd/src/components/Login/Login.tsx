import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { Navigate } from "react-router";
// @ts-ignore
import ghLogo from "../../../assets/gh-logo.png";
import "./Login.css";
import { useCookies } from "react-cookie";
type Credentials = {
	aud: string;
	azp: string;
	email: string;
	email_verified: boolean;
	exp: number;
	family_name: string;
	given_name: string;
	hd: string;
	iat: number;
	iss: string;
	jti: string;
	name: string;
	nbf: number;
	picture: string;
	sub: string;
};

async function register(email: string, name: string) {
	const res = await fetch(
		"https://classcombinator2.vercel.app/api/register",
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify({
				email: email,
				name: name,
			}),
		}
	);
}

export default function Login() {
	let [isError, setIsError] = React.useState(false);
	let [isLogin, setIsLogin] = React.useState(false);
	let [isBanned, setIsBanned] = React.useState(false);
	let [isLoading, setIsLoading] = React.useState(false);
	const [cookies, setCookie, removeCookie] = useCookies(["email"]);
	return (
		<div className="container">
			<h1 className="title">Class Combinator</h1>

			<div className="sub-title">
				<strong>Registration ahead? </strong>
				<span>Class Combinator is here to help you out!</span>
			</div>
			<GoogleOAuthProvider clientId="51730502551-mkkokhpvqbutmqbjsfifnhcdvghe8va9.apps.googleusercontent.com">
				<GoogleLogin
					theme="filled_blue"
					onSuccess={async (credentialResponse) => {
						const cred = jwt_decode(
							credentialResponse.credential!
						) as Credentials;
						setIsLoading(true);
						const host = cred.hd;
						const email = cred.email;
						const name = cred.name;
						if (email === "") {
							setIsBanned(true);
						} else if (host === "ahduni.edu.in") {
							console.log("Login Successful");
							try {
								await register(email, name);
								setCookie("email", email, { path: "/" });
							} catch (e) {
								console.log(e);
							}
							setIsLoading(false);
							setIsLogin(true);
						} else {
							console.log("Login Failed");
							setIsLoading(false);
							setIsError(true);
						}
					}}
					onError={() => {
						console.log("Login Failed");
						setIsError(true);
					}}
				/>
			</GoogleOAuthProvider>
			{isLoading && <b> Loading... </b>}
			{isError && (
				<div>
					<p style={{ color: "red" }}>
						Invalid email! Please only use university email to
						login.
					</p>
				</div>
			)}
			{isLogin && <Navigate to="/Home" />}
			{isBanned && <Navigate to="/Banned" />}
			{/* {<Navigate to="/Home" />} */}
			<div className="footer">
				<span className="note">
					<b>Note: </b>
					Due to other commitments, lack of time and resources, this
					project is <u>no longer maintained</u>. Apologies for the
					same.
				</span>
				<span>
					Contribute to this project on&nbsp;
					<a
						target="_"
						href="https://github.com/JeelRajodiya/AU-ClassCombinator"
					>
						Github
					</a>
				</span>
			</div>
		</div>
	);
}
