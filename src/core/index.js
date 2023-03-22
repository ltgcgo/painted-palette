// Painted Palette core code

"use strict";

import {BuildInfo} from "./common.js";
import {FetchContext} from "./fetchContext.js";
import {RedditAuth} from "./redditAuth.js";

let browserContext, redditAuth;
let logoutEverywhere = async function () {
	if (redditAuth) {
		console.info(`Logging out from Reddit...`);
		await redditAuth.logout();
	};
};
let updateChecker = async function () {
	// Check for pixel updates in parallel
	let remoteVersion = await (await fetch("https://github.com/ltgcgo/painted-palette/raw/main/version")).text();
	remoteVersion = remoteVersion.replaceAll("\r", "\n").replaceAll("\n", "").trim();
	if (remoteVersion != BuildInfo.ver) {
		console.info(`Update available (v${remoteVersion})!`);
		if (WingBlade.os.toLowerCase() == "windows") {
			await logoutEverywhere();
			console.info(`Please update and restart ${BuildInfo.name} manually.\nYou only need to replace the current deno.js file with the newer file.\nDownload link: https://github.com/ltgcgo/painted-palette/releases/download/${remoteVersion}/${WingBlade.variant.toLowerCase()}.js\nQuitting...`);
			WingBlade.exit(1);
		} else {
			console.info("Downloading the new update...");
			let downloadStream = (await fetch(`https://github.com/ltgcgo/painted-palette/releases/download/${remoteVersion}/${WingBlade.variant.toLowerCase()}.js`)).body;
			await WingBlade.writeFile("./patched.js", downloadStream);
			await logoutEverywhere();
			console.info(`${BuildInfo.name} will restart shortly to finish updating.`);
			WingBlade.exit(0);
		};
	};
};

let main = async function (args) {
	let acct = args[1], pass = args[2], otp = args[3];
	console.info(`${BuildInfo.name}@${WingBlade.variant} ${WingBlade.os}_v${BuildInfo.ver}`);
	let updateThread = setInterval(updateChecker, 20000);
	switch (args[0]) {
		case "paint": {
			console.info(`Opening Reddit...`);
			// Initial Reddit browsing
			browserContext = new FetchContext("https://www.reddit.com");
			await browserContext.fetch("https://www.reddit.com", {
				"init": "browser"
			});
			await WingBlade.sleep(1200, 1800);
			// Begin the Reddit auth flow
			console.info(`Opening the login page...`);
			redditAuth = new RedditAuth(browserContext);
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
			await logoutEverywhere();
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
			if (WingBlade.os != "windows") {
				console.info("\n./install.sh is provided to reinstall this program.");
			} else {
				console.info("\nManual update is required, but only deno.js needs to be replaced.");
			};
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
