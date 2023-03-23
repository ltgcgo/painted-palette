"use strict";

import {DOMParser} from "../../libs/xmldom/xmldom.js";
let encodeURL = encodeURIComponent;

let returnDest = "https://www.reddit.com";
let domParser = new DOMParser();

let RedditAuth = class {
	context;
	loggedIn = false;
	get authInfo() {
		let fc = this.context;
		return {
			loid: fc.cookies["loid"],
			session: JSON.parse(atob(fc.cookies["token_v2"].split(".")[1])),
			tracker: fc.cookies["session_tracker"]
		};
	};
	async login(username = "", password = "", otp = "") {
		let fc = this.context;
		// Fetching CSRF token
		let body = await (await fc.fetch("https://www.reddit.com/login/", {
			"init": "browser"
		})).text();
		let dom = domParser.parseFromString(body, "text/html");
		let csrf = "";
		Array.from(dom.getElementsByTagName("input")).forEach((e) => {
			let key = e.getAttribute("name"), value = e.getAttribute("value");
			if (key == "csrf_token") {
				csrf = value;
			};
		});
		await WingBlade.sleep(2000, 3000);
		// Authenticating
		console.info(`CSRF token fetched (${csrf})! Logging in...`);
		fc.referer = "https://www.reddit.com/login/";
		//body = `csrf_token=${csrf}&otp=${encodeURL(otp)}&password=${encodeURL(password)}&dest=${encodeURL(returnDest)}&username=${encodeURL(username)}`;
		body = new FormData();
		body.set("csrf_token", csrf);
		body.set("otp", "");
		body.set("password", password);
		body.set("dest", returnDest);
		body.set("username", username);
		body = (new URLSearchParams(body)).toString();
		let authReply = await fc.fetch("https://www.reddit.com/login", {
			"method": "POST",
			"headers": {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": body.length.toString()
			},
			"body": body
		});
		if (authReply.status != 200) {
			return await authReply.statusText;
		};
		// Cleanup
		fc.referer = "https://www.reddit.com/";
		this.loggedIn = true;
		await WingBlade.sleep(500, 1500);
		console.info(`Reloading Reddit home page...`);
		await fc.fetch("https://www.reddit.com/", {
			"init": "browser"
		});
		return "";
	};
	async logout() {
		let fc = this.context;
		fc.referer = "https://www.reddit.com/";
		await fc.fetch("https://www.reddit.com/", {
			"init": "browser"
		});
		let authToken = this.authInfo.session.sub;
		let body = `access_token=${encodeURL(authToken)}`;
		let response = await fc.fetch("https://www.reddit.com/logoutproxy", {
			"method": "POST",
			"headers": {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-Length": body.length.toString(),
				"Authorization": `Bearer ${authToken}`,
				"reddit-user_id": "desktop2x",
				"x-reddit-loid": this.authInfo.loid,
				"x-reddit-session": this.authInfo.tracker
			},
			body
		});
		//console.info(response.status);
		if (response.status == 200) {
			this.loggedIn = false;
		};
	};
	constructor(context) {
		this.context = context;
	};
};

export {
	RedditAuth
};
