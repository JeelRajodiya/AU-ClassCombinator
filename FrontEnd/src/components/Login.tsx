import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
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
	return (
		<div>
			<GoogleOAuthProvider clientId="51730502551-mkkokhpvqbutmqbjsfifnhcdvghe8va9.apps.googleusercontent.com">
				<GoogleLogin
					onSuccess={(credentialResponse) => {
						const host = (
							jwt_decode(
								credentialResponse.credential!
							) as Credentials
						).hd;
						if (host === "ahduni.edu.in") {
							console.log("Login Successful");
						} else {
							console.log("Login Failed");
						}
					}}
					onError={() => {
						console.log("Login Failed");
					}}
				/>
			</GoogleOAuthProvider>
		</div>
	);
}