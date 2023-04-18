import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { GoogleLogin } from "@react-oauth/google";
export default function Login() {
	return (
		<div>
			<GoogleOAuthProvider clientId="51730502551-mkkokhpvqbutmqbjsfifnhcdvghe8va9.apps.googleusercontent.com">
				<GoogleLogin
					onSuccess={(credentialResponse) => {
						console.log(credentialResponse);
					}}
					onError={() => {
						console.log("Login Failed");
					}}
				/>
			</GoogleOAuthProvider>
		</div>
	);
}
