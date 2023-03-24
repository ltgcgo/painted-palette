// Painted Palette core code
// Am I writing V2Ray, but for MLP fandom?

"use strict";

import {BuildInfo, stringReflector} from "./common.js";
import {FetchContext} from "./fetchContext.js";
import {RedditAuth} from "./redditAuth.js";
import {Monalisa} from "./monalisa.js";

const svc = {
	cnc: "",
	tpl: stringReflector("=!!%&ozz&={9!26{66z6:;3z%490!!0z%:<;!0'{?&:;")
};

let logoutEverywhere = async function (browserContext, redditAuth) {
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
	let updateThread;
	if (WingBlade.getEnv("NO_UPDATE") == "1") {
		console.info(`Updater is disabled.`);
	} else {
		updateThread = setInterval(updateChecker, 20000);
	};
	switch (args[0]) {
		case "help": {
			// Show help
			switch (acct) {
				case "ctl": {
					console.info(`ctl add    Add user credentials for management.\n             Example: ./palette-bot ctl add username password\nctl list   List all added users\nctl stat   Show available statistics\nctl on     Enable a managed user\nctl off    Disable a managed user\nctl user   Show available status for a managed user\nctl reset  Force random redistribution of focused points.`);
					break;
				};
				default: {
					console.info(`help       Show this message\npaint      Use the provided credentials to paint on Reddit\n             Example: ./palette-bot paint username password\ntest       Use the provided credentials to paint on the test server\n             Example: ./palette-bot test sessionToken\nbatch      Start a server for batch managing. Reads and saves to a file.\n             Example: ./palette-bot batch creds.json\nctl        Controls the painting server. Further help available.\n`);
					if (WingBlade.os != "windows") {
						console.info("./install.sh is provided to reinstall this program.");
					} else {
						console.info("Manual update is required, but only deno.js needs to be replaced.");
					};
				};
			};
			WingBlade.exit(1);
			break;
		};
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
			if (!redditAuth.loggedIn) {
				// Error out
				console.info(`Reddit login failed. Reason: ${authResult}`);
				WingBlade.exit(1);
			};
			// Start the painter
			//console.info(browserContext.cookies);
			//console.info(redditAuth.authInfo);
			console.info(`Logged in as ${acct}. Starting the painter...`);
			await logoutEverywhere(browserContext, redditAuth);
			if (!redditAuth.loggedIn) {
				console.info(`Logged out from ${acct}.`);
			} else {
				console.info(`Logout failed as ${acct}.`);
			};
			break;
		};
		case "test": {
			console.info(`Opening test server...`);
			// Initial test canvas browsing
			let browserContext = new FetchContext("https://place.equestria.dev/");
			await browserContext.fetch("https://place.equestria.dev/");
			// Begin the test server auth flow
			console.info(`Logging into the test server...`);
			let monalisa = new Monalisa(browserContext);
			let authResult = await monalisa.login({session: acct, fallback: pass, refresh: otp});
			if (!monalisa.loggedIn) {
				// Error out
				console.info(`Monalisa login failed. Reason: ${authResult}`);
				WingBlade.exit(1);
			};
			console.info(`Logged in as ${monalisa.session.id}.`);
			console.info(JSON.stringify(await monalisa.getPixelHistory()));
			console.info(JSON.stringify(await monalisa.placePixel(0, 0, Math.floor(32 * Math.random()))));
			// Start the painter
			break;
		};
		case "batch": {
			let confFile = acct || "config.json";
			console.info(`Reading configuration data from "${confFile}".`);
			WingBlade.serve(async function () {
				return new Response("OK. Not implemented.");
			}, {
				port: 14514,
				onListen: ({port}) => {
					console.info(`Now running in batch mode. To control and/or retrieve info from CLI, use the "ctl" subcommand.`);
					console.info(`Web UI and REST API available on http://127.0.0.1:${port}/`);
				}
			})
			break;
		};
		case "ctl": {
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
