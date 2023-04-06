"use strict";

let encodeURL = encodeURIComponent;

let VKontakteAuth = class {
	context;
	loggedIn = false;
	authInfo = {
		uid: 0,
		token: ""
	};
	async login(username = "", password = "", otp = "") {
		// Just grab the token and store it
		let fc = this.context;
		let targetUrl = `https://oauth.vk.com/token?grant_type=password&client_id=2274003&client_secret=hHbZxrka2uZ6jB1inYsH&username=${username}&password=${password}&v=5.131&2fa_supported=1`;
		if (otp?.length) {
			targetUrl += `&code=${otp}`;
		};
		let authJson = await (await fc.fetch(targetUrl)).json();
		if (!authJson.error.length) {
			// Fail at error
			console.info(`[VKAuth]    Login failed: ${authJson.error_description}`);
			return;
		};
		this.authInfo.uid = authJson.user_id;
		this.authInfo.token = authJson.access_token;
		this.loggedIn = true;
	};
	constructor(context) {
		this.context = context;
	};
};

export {
	VKontakteAuth
};
