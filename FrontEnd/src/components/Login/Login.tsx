import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { Navigate } from "react-router";
import "./Login.css";
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
		"https://classcombinator2.vercel.app//api/register",
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
	return (
		<div className="container">
			<h2>Login with your university email to access the Combinator</h2>
			<GoogleOAuthProvider clientId="51730502551-mkkokhpvqbutmqbjsfifnhcdvghe8va9.apps.googleusercontent.com">
				<GoogleLogin
					theme="filled_blue"
					onSuccess={async (credentialResponse) => {
						const cred = jwt_decode(
							credentialResponse.credential!
						) as Credentials;
						const host = cred.hd;
						const email = cred.email;
						const name = cred.name;
						if (email === "") {
							setIsBanned(true);
						} else if (host === "ahduni.edu.in") {
							console.log("Login Successful");
							await register(email, name);
							setIsLogin(true);
						} else {
							console.log("Login Failed");
							setIsError(true);
						}
					}}
					onError={() => {
						console.log("Login Failed");
						setIsError(true);
					}}
				/>
			</GoogleOAuthProvider>
			{isError && (
				<div>
					<p>Please use your university email to login.</p>
				</div>
			)}
			{isLogin && <Navigate to="/Home" />}
			{isBanned && <Navigate to="/Banned" />}
			{/* {<Navigate to="/Home" />} */}
		</div>
	);
}
