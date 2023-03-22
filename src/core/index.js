// Painted Palette core code

"use strict";

import {BuildInfo} from "./common.js";
import {FetchContext} from "./fetchContext.js";
import {RedditAuth} from "./redditAuth.js";

let updateChecker = async function () {
	// Check for pixel updates in parallel
	let remoteVersion = ((await fetch("https://github.com/ltgcgo/painted-palette/raw/main/version")).text()).replaceAll("\r", "\n").replaceAll("\n", "").trim();
	console.info("Local: v${BuildInfo.ver}, remote: v${remoteVersion}");
	if (remoteVersion != BuildInfo.ver) {
		console.info("Update available (v${remoteVersion})! Downloading the new update...");
	};
	if (WingBlade.os == "Windows") {
		console.info(`Please restart ${BuildInfo.name} manually. Quitting...`);
		WingBlade.exit(1);
	} else {
		console.info(`${BuildInfo.name} will restart shortly to finish its update.`);
		//WingBlade.exit(0);
	};
};

let main = async function (args) {
	let acct = args[1], pass = args[2], otp = args[3];
	console.info(`${BuildInfo.name}@${WingBlade.variant} v${BuildInfo.ver}`);
	switch (args[0]) {
		case "paint": {
			console.info(`Opening Reddit...`);
			// Initial Reddit browsing
			let browserContext = new FetchContext("https://www.reddit.com");
			await browserContext.fetch("https://www.reddit.com", {
				"init": "browser"
			});
			await WingBlade.sleep(1200, 1800);
			// Begin the Reddit auth flow
			console.info(`Opening the login page...`);
			let redditAuth = new RedditAuth(browserContext);
			let authResult = await redditAuth.login(acct, pass, otp);
			if (redditAuth.loggedIn) {
				// Start the painter
				//console.info(browserContext.cookies);
				//console.info(redditAuth.authInfo);
				console.info(`You're now logged in. Starting the painter...`);
			} else {
				// Error out
				console.info(`Reddit login failed. Reason: ${authResult}`);
				WingBlade.exit(1);
			};
			break;
		};
		case "test": {
			console.info(`Opening test server...`);
			// Initial test canvas browsing
			let browserContext = new FetchContext("https://place.equestria.dev/");
			await browserContext.fetch("https://place.equestria.dev/");
			// Begin the test server auth flow
			// Start the painter
			break;
		};
		case "help": {
			// Show help
			console.info(`help       Show this message\npaint      Use the provided credentials to paint on Reddit\n             Example: ./palette-bot paint username password\ntest       Use the provided credentials to paint on the test server\n             Example: ./palette-bot test sessionToken fallbackToken refreshToken`);
			WingBlade.exit(1);
			break;
		};
		default: {
			console.info(`Unknown subcommand "${args[0] || ""}". Execute "help" for help.`);
			WingBlade.exit(1);
		};
	};
};

export {
	main
};
