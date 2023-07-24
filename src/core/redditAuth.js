"use strict";

import {DOMParser} from "../../libs/xmldom/xmldom.js";
import {deriveHash} from "./derive.js";

let encodeURL = encodeURIComponent;

let returnDest = "https://www.reddit.com";
let domParser = new DOMParser();

let RedditAuth = class {
	context;
	loggedIn = false;
	userHash = "";
	get authInfo() {
		let fc = this.context;
		return {
			loid: fc.cookies["loid"],
			session: JSON.parse(atob(fc.cookies["token_v2"]?.split(".")[1] || "{}")),
			tracker: fc.cookies["session_tracker"]
		};
	};
	async login(username = "", password = "", otp = "") {
		this.userHash = deriveHash(username);
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
		await WingBlade.util.sleep(2000, 2000);
		// Authenticating
		console.info(`[RedditAuth]CSRF token fetched (${csrf})!`);
		await WingBlade.util.sleep(1000, 1000);
		console.info(`[RedditAuth]Logging in...`);
		fc.referer = "https://www.reddit.com/login/";
		body = `csrf_token=${csrf}&otp=${encodeURL(otp)}&password=${encodeURL(password)}&dest=${encodeURL(returnDest)}&username=${encodeURL(username)}`;
		/* body = new FormData();
		body.set("csrf_token", csrf);
		body.set("otp", otp);
		body.set("password", password);
		body.set("dest", returnDest);
		body.set("username", username);
		body = (new URLSearchParams(body)).toString(); */
		let authReply, error;
		try {
			authReply = await fc.fetch("https://www.reddit.com/login", {
				"method": "POST",
				"headers": {
					"Content-Type": "application/x-www-form-urlencoded",
					"Content-Length": body.length.toString(),
					"Referer": "https://www.reddit.com/login/"
				},
				"body": body
			})
		} catch (err) {
			console.info(`[RedditAuth]Reddit login failed. ${err.name || "CustomError"} ${err.message || "Request crashed"}\n${err.stack || "Request crashed."}`);
			error = err;
		};
		if (!authReply) {
			console.info(`[RedditAuth]Cancelling login attempt...`);
			fc.referer = "https://www.reddit.com/";
			this.loggedIn = false;
			return `${error?.message || "Request crashed"}`;
		};
		if (authReply.status != 200) {
			console.info(await authReply.text());
			return await authReply.statusText;
		};
		// Cleanup
		fc.referer = "https://www.reddit.com/";
		this.loggedIn = true;
		await WingBlade.util.sleep(500, 1500);
		console.info(`[RedditAuth]Reloading Reddit home page...`);
		await fc.fetch("https://www.reddit.com/", {
			"init": "browser"
		});
		return "";
	};
	async logout() {
		if (!this.loggedIn) {
			return;
		};
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
				/* "x-reddit-loid": this.authInfo.loid,
				"x-reddit-session": this.authInfo.tracker, */
				"reddit-user_id": "desktop2x"
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
