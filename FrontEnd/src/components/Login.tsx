import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
export default function Login() {
	return (
		<div>
			<GoogleOAuthProvider clientId="51730502551-mkkokhpvqbutmqbjsfifnhcdvghe8va9.apps.googleusercontent.com">
				<GoogleLogin
					onSuccess={(credentialResponse) => {
						console.log(jwt_decode(credentialResponse.credential!));
					}}
					onError={() => {
						console.log("Login Failed");
					}}
				/>
			</GoogleOAuthProvider>
		</div>
	);
}
