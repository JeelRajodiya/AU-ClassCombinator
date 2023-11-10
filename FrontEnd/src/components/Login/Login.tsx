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
					onSuccess={(credentialResponse) => {
						const cred = jwt_decode(
							credentialResponse.credential!
						) as Credentials;
						const host = cred.hd;
						const email = cred.email;
						if (email === "zeel.r@ahduni.edu.in") {
							setIsBanned(true);
						} else if (host === "ahduni.edu.in") {
							console.log("Login Successful");
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
