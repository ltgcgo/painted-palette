// Painted Palette core code
// Am I writing V2Ray, but for MLP fandom?

"use strict";

import {BuildInfo, humanizedTime} from "./common.js";
import {IPInfo} from "../core/ipinfo.js";
import {FetchContext} from "./fetchContext.js";
import {RedditAuth} from "./redditAuth.js";
import {Monalisa} from "./monalisa.js";
import {Analytics} from "./analytics.js";
import webUiBody from "../web/index.htm";
import webUiCss from "../web/index.css";
import picoCss from "../../libs/picocss/pico.css";
import webUiJs from "../../dist/web.js.txt";

import {pako} from "../../libs/pako/bridge.min.js";
self.pako = pako;
import {UPNG} from "../../libs/upng/upng.min.js";

const svc = {
	cnc: "",
	tpl: "https://github.com/ltgcgo/painted-palette/raw/main/conf/service/rdnsptr.json"
};

let logoutEverywhere = async function (browserContext, redditAuth) {
	if (redditAuth) {
		console.info(`Logging out from Reddit...`);
		await redditAuth.logout();
	};
};
let updateChecker = async function () {
	try {
		// Check for pixel updates in parallel
		let remoteVersion = await (await fetch("https://github.com/ltgcgo/painted-palette/raw/main/version")).text();
		remoteVersion = remoteVersion.replaceAll("\r", "\n").replaceAll("\n", "").trim();
		if (remoteVersion != BuildInfo.ver) {
			console.info(`Update available (v${remoteVersion})!`);
			console.info("Downloading the new update...");
			let downloadStream = (await fetch(`https://github.com/ltgcgo/painted-palette/releases/download/${remoteVersion}/${WingBlade.variant.toLowerCase()}.js`)).body;
			await WingBlade.writeFile("./patched.js", downloadStream);
			await logoutEverywhere();
			if (WingBlade.os.toLowerCase() == "windows") {
				console.info(`Please update and restart ${BuildInfo.name} manually.\nIf you don't see a "patched.js" file appearing in your folder, you only need to replace the current deno.js file with the newer file.\nDownload link: https://github.com/ltgcgo/painted-palette/releases/download/${remoteVersion}/${WingBlade.variant.toLowerCase()}.js\nQuitting...`);
				WingBlade.exit(1);
			} else {
				console.info(`${BuildInfo.name} will restart shortly to finish updating.`);
				WingBlade.exit(0);
			};
		};
	} catch (err) {
		console.info(`Update checker failed. ${err}`);
	};
};
let waitForProxy = async function () {
	let proxyOn = WingBlade.getEnv("HTTPS_PROXY");
	if (proxyOn) {
		if (WingBlade.getEnv("LONGER_START")) {
			console.info(`Waiting for ${WingBlade.getEnv("LONGER_START")} on ${proxyOn}, control port on ${WingBlade.getEnv("CTRL_PORT")}...`);
			await WingBlade.sleep(10000);
		} else {
			console.info(`Waiting for the proxy client on ${proxyOn} ...`);
			await WingBlade.sleep(1000);
		};
	};
};
let refreshTemplate = async function (fc, paintGuideObj) {
	try {
		let pointer = await (await fc.fetch(svc.tpl)).json();
		let maskData, botImageData;
		for (let i = 0; i < pointer?.mask?.length; i ++) {
			let url = pointer?.mask[i];
			if (!maskData) {
				let arrayBuffer = await (await fc.fetch(url)).arrayBuffer();
				maskData = UPNG.decode(arrayBuffer);
				arrayBuffer = undefined;
			};
		};
		for (let i = 0; i < pointer?.bot?.length; i ++) {
			let url = pointer?.bot[i];
			if (!botImageData) {
				let arrayBuffer = await (await fc.fetch(url)).arrayBuffer();
				botImageData = UPNG.decode(arrayBuffer);
				arrayBuffer = undefined;
			};
		};
		if (maskData && botImageData) {
			paintGuideObj.x = pointer.offX || 0;
			paintGuideObj.y = pointer.offY || 0;
			let maskArr = UPNG.toRGBA8(maskData)[0];
			let botData = UPNG.toRGBA8(botImageData)[0];
			let maskView = new DataView(maskArr);
			let botView = new DataView(botData);
			let width = maskData.width;
			for (let i = 0; i < maskArr.byteLength; i += 4) {
				let prio = maskData.getUint8();
			};
			maskArr = undefined; // Drop it as soon as possible
			delete maskData.data;
			delete maskData.frames;
			delete maskData.tabs;
			maskData = undefined; // Drop!
			delete botData.buffer;
			delete botImageData.data;
			delete botImageData.frames;
			delete botImageData.tabs;
			botImageData = undefined; // Drop!
			botData = undefined; // Again, drop as soon as possible
			console.info(paintGuideObj);
			if (paintGuideObj.onbuild) {
				paintGuideObj.onbuild(paintGuideObj);
			};
		};
	} catch (err) {
		console.info(`Template refresh failure: ${err}`);
	};
};
let rebuildDamageCloud = async function (paintGuideObj) {};
/*
Paint Guide Object
{
	x: offsetX,
	y: offsetY,
	mask: {
		w: width,
		h: height,
		d: Uint8Array(len)
	},
	bot: {
		w: width,
		h: height,
		d: Uint8Array(len * 4)
	},
	damage: kdTree,
	pixels: {
		sum: totalCount,
		diff: diffCount
	},
	cc: CanvasConfiguration
}
*/

let main = async function (args) {
	let acct = args[1], pass = args[2], otp = args[3];
	console.info(`${BuildInfo.name}@${WingBlade.variant} ${WingBlade.os}_v${BuildInfo.ver}`);
	let updateThread;
	if (WingBlade.getEnv("NO_UPDATE") == "1") {
		console.info(`Updater is disabled.`);
	} else {
		updateThread = setInterval(updateChecker, 20000);
	};
	let paintAnalytics = new Analytics('https://analytics.place.equestria.dev');
	// If the painter starts
	let botSensitivity = 1, botPower, botMagazine = 2, botPlaced = 0;
	switch (args[0]) {
		case "help": {
			// Show help
			switch (acct) {
				case "ctl": {
					console.info(`\nSet the server port with the optional PORT environment variable. 14514 by default.\n\nctl add    Add user credentials for management. OTP is optional\n             Example: ./palette-bot ctl add username password\n             Example: ./palette-bot ctl add username password otp\nctl del    Remove credentials of a user\n             Example: ./palette-bot ctl del username\nctl list   List all added users\nctl stat   Show available statistics\nctl on     Enable a managed user\nctl gon    Enable all managed users\nctl off    Disable a managed user\nctl goff   Disable all managed users\nctl user   Show available statuses for a managed user\nctl reset  Force random redistribution of focused points\nctl power  Set a power value between 1 and 0. Scaled by damage if blank\nctl scale  Set a sensitivity value equals to and greater than 0. Set to 1 if blank`);
					break;
				};
				default: {
					console.info(`help       Show this message\npaint      Use the provided credentials to paint on Reddit\n             Example: ./palette-bot paint username password\ntest       Use the provided credentials to paint on the test server\n             Example: ./palette-bot test sessionToken\nbatch      Start a server for managing. Reads and saves to a file. Port number is optional\n             Example: ./palette-bot batch 14514\nctl        Controls the painting server. Further help available\n`);
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
			await waitForProxy();
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
			await waitForProxy();
			console.info(`Opening test server...`);
			// Initial test canvas browsing
			let browserContext = new FetchContext('https://place.equestria.dev');
			let paintGuide = {};
			let templateRefresher = async () => {
				await refreshTemplate(browserContext, paintGuide);
			},
			templateThread = setInterval(templateRefresher, 180000);
			templateRefresher();
			await browserContext.fetch('https://place.equestria.dev/');
			// Begin the test server auth flow
			console.info(`Logging into the test server...`);
			let monalisa = new Monalisa(browserContext);
			let authResult = await monalisa.login({session: acct, fallback: pass, refresh: otp});
			if (!monalisa.loggedIn) {
				// Error out
				console.info(`Monalisa login failed. Reason: ${authResult}`);
				WingBlade.exit(1);
			};
			console.info(`Logged in as ${monalisa.session}. Receiving canvas config...`);
			await monalisa.refreshInfo();
			console.info(`Next pixel in ${(monalisa.nextAt - Date.now()) / 1000} seconds.`);
			await monalisa.startStream();
			await monalisa.whenCcReady();
			// Start the painter
			let power = 1;
			let keepRunning = true;
			while (keepRunning) {
				let timeNow = Date.now();
				if (timeNow < monalisa.nextAt) {
					console.info(`Still under cooldown. ${monalisa.nextAt - timeNow} seconds left.`);
				} else if (Math.random() < power) {
					console.info(`Placing pixels...`);
					await monalisa.getPixelHistory();
					//console.info(JSON.stringify());
					let colourDesired = [WingBlade.randomInt(256), WingBlade.randomInt(256), WingBlade.randomInt(256)];
					let colourPicked = monalisa.cc.colours.nearest(colourDesired);
					console.info(`Chose ${colourPicked} for ${colourDesired}.`);
					let nextAt = await monalisa.placePixel(WingBlade.randomInt(10), 0, colourPicked[3]);
					console.info(`Next pixel in ${(nextAt - Date.now()) / 1000} seconds.`);
				} else {
					console.info(`Bot waiting for the next sweep.`);
				};
				await WingBlade.sleep(5000);
			};
			break;
		};
		case "batch": {
			await waitForProxy();
			let runSince = Date.now();
			let systemBrowser = new FetchContext('https://place.equestria.dev');
			let paintGuide = {};
			let templateRefresher = async () => {
				await refreshTemplate(systemBrowser, paintGuide);
			},
			templateThread = setInterval(templateRefresher, 180000);
			templateRefresher();
			let confFile = parseInt(acct) || 14514;
			let managedUsers = {};
			console.info(`Reading configuration data from "${confFile}.json".`);
			let ipInfo = new IPInfo();
			ipInfo.start();
			WingBlade.serve(async function (request) {
				let badRequest = new Response("Bad Request", {
					status: 400
				});
				let notFound = new Response("Not Found", {
					status: 404
				});
				let url = new URL(request.url);
				switch (request.method.toLowerCase()) {
					case "get": {
						switch (url.pathname) {
							case "/":
							case "/index.htm": {
								return new Response(webUiBody, {
									"headers": {
										"Content-Type": "text/html"
									}
								});
								break;
							};
							case "/pico.css": {
								return new Response(picoCss, {
									"headers": {
										"Content-Type": "text/css"
									}
								});
								break;
							};
							case "/index.css": {
								return new Response(webUiCss, {
									"headers": {
										"Content-Type": "text/css"
									}
								});
								break;
							};
							case "/index.js": {
								return new Response(webUiJs, {
									"headers": {
										"Content-Type": "text/javascript"
									}
								});
								break;
							};
							case "/info": {
								return new Response(JSON.stringify({
									plat: {
										var: WingBlade.variant,
										os: WingBlade.os
									},
									ip: {
										ip: ipInfo.ip,
										cc: ipInfo.cc,
										asn: ipInfo.asn,
										as: ipInfo.as
									},
									acct: {},
									proxy: WingBlade.getEnv("HTTPS_PROXY") ? (WingBlade.getEnv("PROXY_PORT") ? (WingBlade.getEnv("LONGER_START") || "Standalone") : "System") : "No Proxy",
									uptime: Date.now() - runSince,
									bot: {
										sen: botSensitivity,
										mag: botMagazine,
										px: botPlaced
									}
								}), {
									"headers": {
										"Content-Type": "application/json"
									}
								});
								break;
							};
							case "/events": {
								// Allow pushing events to the clients
								if (!request.headers.has("upgrade")) {
									return badRequest;
								};
								let {socket, response} = WingBlade.upgradeWebSocket(request);
								socket.addEventListener("open", () => {
									socket.send("Hi Luna!");
								});
								socket.addEventListener("close", () => {
									console.info("WS closed.");
								});
								return response;
								break;
							};
							default: {
								return notFound;
							};
							case "/user": {
								// Get a user
								break;
							};
						};
						break;
					};
					case "post": {
						switch (url.pathname) {
							case "/user": {
								// Add a user
								break;
							};
							default: {
								return notFound;
							};
						};
						break;
					};
					case "delete": {
						switch (url.pathname) {
							case "/user": {
								// Remove a user
								break;
							};
							default: {
								return notFound;
							};
						};
						break;
					};
					default: {
						return new Response("Invalid method", {
							status: 405
						});
					};
				};
			}, {
				port: acct || 14514,
				onListen: ({port}) => {
					console.info(`Now running in batch mode. To control and/or retrieve info from CLI, use the "ctl" subcommand.`);
					console.info(`Web UI and REST API available on http://127.0.0.1:${port}/`);
					if (WingBlade.os.toLowerCase() == "windows") {
						console.info(`Open the link above in your browser of choice, and start fighting, soldier!`);
					};
				}
			})
			break;
		};
		case "ctl": {
			let port = WingBlade.getEnv("PORT") || "14514";
			let prefix = `http://127.0.0.1:${port}/`;
			console.info("");
			switch (acct) {
				case "info":
				case "stat": {
					let jsonData = await(await fetch (`${prefix}info`)).json();
					console.info(`IP Information\nProxy: ${jsonData.proxy}\nIP: ${jsonData.ip.ip}\nCountry: ${jsonData.ip.cc}\nASN: ${jsonData.ip.asn}\nAS: ${jsonData.ip.as}\n\nStatistics\nFinished: \nSensitivity: \nPower: \nAccounts: ${jsonData.acct?.sum}\nActive: \nMagazine: \nBanned: ${jsonData.acct?.banned}\nFresh: ${jsonData.acct?.fresh}\nPlaced Pixels: ${jsonData.placed}\nUptime: ${humanizedTime(jsonData.uptime / 1000)}`);
					break;
				};
				default: {
					console.info(`Unknown subcommand "${acct || ""}". Execute "help ctl" for help.`);
				};
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
