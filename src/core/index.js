// Painted Palette core code
// Am I writing V2Ray, but for MLP fandom?

"use strict";

import {BuildInfo, humanizedTime} from "./common.js";
import {IPInfo} from "./ipinfo.js";
import {FetchContext} from "./fetchContext.js";
import {RedditAuth} from "./redditAuth.js";
import {VKontakteAuth} from "./vkAuth.js";
import {Monalisa} from "./monalisa.js";
import {PixelBattle} from "./pixelBattle.js";
import {Analytics} from "./analytics.js";
import {PaintGuide} from "./paintGuide.js";

import webUiBody from "../web/index.htm";
import webUiCss from "../web/index.css";
import picoCss from "../../libs/picocss/pico.css";
import webUiJs from "../../dist/web.js.txt";

import {CustomEventSource} from "../../libs/lightfelt/ext/customEvents.js";
import {pako} from "../../libs/pako/bridge.min.js";
self.pako = pako;

let utf8Decode = new TextDecoder(), utf8Encode = new TextEncoder();

const svc = {
	cnc: "",
	tpl: "https://gh.ltgc.cc/painted-palette/conf/service/pointer.json"
};
const batchModeOrigin = 'https://place.equestria.dev';

let logoutEverywhere = async function (browserContext, redditAuth) {
	if (redditAuth) {
		console.info(`[Core]      Logging out from Reddit...`);
		await redditAuth.logout();
	};
};
let updateChecker = async function () {
	try {
		// Check for pixel updates in parallel
		let remoteVersion = await (await fetch("https://gh.ltgc.cc/painted-palette/version")).text();
		remoteVersion = remoteVersion.replaceAll("\r", "\n").replaceAll("\n", "").trim();
		if (remoteVersion != BuildInfo.ver) {
			console.info(`[Updater]   Update available (v${remoteVersion})!`);
			console.info(`[Updater]   Downloading the new update...`);
			let downloadReq = await fetch(`https://github.com/ltgcgo/painted-palette/releases/download/${remoteVersion}/${WingBlade.variant.toLowerCase()}.js`);
			if (downloadReq.status != 200) {
				console.info(`[Updater]   Download error: ${downloadReq.statusText}`);
				return;
			};
			let downloadStream = downloadReq.body;
			await WingBlade.writeFile("./patched.js", downloadStream);
			await logoutEverywhere();
			if (WingBlade.os.toLowerCase() == "windows") {
				console.info(`[Updater]   Please update and restart ${BuildInfo.name} manually.\nIf you don't see a "patched.js" file appearing in your folder, you only need to replace the current deno.js file with the newer file.\nDownload link: https://github.com/ltgcgo/painted-palette/releases/download/${remoteVersion}/${WingBlade.variant.toLowerCase()}.js\nQuitting...`);
				WingBlade.exit(1);
			} else {
				console.info(`[Updater]   ${BuildInfo.name} will restart shortly to finish updating.`);
				WingBlade.exit(0);
			};
		};
	} catch (err) {
		console.info(`[Updater]   Update checker failed. ${err}`);
	};
};
let waitForProxy = async function () {
	let proxyOn = WingBlade.getEnv("HTTPS_PROXY");
	if (proxyOn) {
		if (WingBlade.getEnv("LONGER_START")) {
			console.info(`[Core]      Waiting for ${WingBlade.getEnv("LONGER_START")} on ${proxyOn}, control port on ${WingBlade.getEnv("CTRL_PORT")}...`);
			await WingBlade.sleep(10000);
		} else {
			console.info(`[Core]      Waiting for the proxy client on ${proxyOn} ...`);
			await WingBlade.sleep(1000);
		};
	};
};

let ManagedUser = class extends CustomEventSource {
	username = "";
	password = "";
	otp = "";
	active = false;
	fc = new FetchContext(batchModeOrigin);
	redditAuth; // Attach a Reddit authenticator
	monalisa; // Attach a painter
	get authInfo() {
		return this.redditAuth?.authInfo;
	};
	startPp() {
		this.monalisa?.pg?.addEventListener("templateupdate", async () => {
			await this.monalisa.partitionPixels();
			await this.monalisa.rebuildDamageCloud();
		});
	};
	async enable() {
		await this.redditAuth?.login(this.username, this.password, this.otp);
		await this.monalisa?.login({
			username: this.username,
			password: this.password,
			otp: this.otp});
		this.monalisa.setSession(this.username);
		this.active = true;
		return;
	};
	async disable() {
		await this.monalisa?.stopStream();
		await this.monalisa?.logout();
		await this.redditAuth?.logout();
		this.active = false;
		return;
	};
	constructor({username = "", password = "", otp = ""}) {
		super();
		this.username = username;
		this.password = password;
		this.otp = otp;
	};
};
let MultiUserManager = class extends CustomEventSource {
	#sweeping = false;
	managed = {};
	length = 0;
	pg; // Attach a global paint guide
	cc = {}; // Reused canvas config
	conf; // Attach a config object
	activeWs; // Attach a Monalisa object to listen to WS streams
	has(username) {
		if (this.managed[username]) {
			return true;
		} else {
			//console.info(`[MultiMan]  Account ${username} does not exist.`);
			return false;
		};
	};
	get(username) {};
	getPower() {
		// Scale power based on received damage
		if (this.conf?.power != undefined) {
			return this.conf.power || 0;
		};
		return Math.max(0, Math.min(1,
			(this.conf?.sensitivity || 1) * ((this.cc?.damaged || 0) / (this.pg?.pixels || 1))
		));
	};
	getPlaced() {
		let placed = 0;
		for (let u in this.conf.users) {
			placed += this.conf.users[u].placed || 0;
		};
		return placed;
	};
	getCounts() {
		let stat = {
			active: 0,
			enabled: 0,
			banned: 0,
			fresh: 0
		};
		for (let u in this.conf.users) {
			let e = this.conf.users[u];
			if (e.active) {
				stat.active ++;
			};
			if (e.enabled) {
				stat.enabled ++;
			};
			if (e.banned) {
				stat.banned ++;
			};
			if (e.fresh) {
				stat.fresh ++;
			};
		};
		return stat;
	};
	async countActive() {
		let sum = 0;
		for (let i in this.managed) {
			if (this.managed[i]?.active) {
				sum ++;
			};
		};
		return sum;
	};
	async enable(username, noEnable) {
		if (!this.has(username)) {
			return;
		};
		this.conf.users[username].enabled = true;
		if (!noEnable) {
			if (!this.managed[username].active) {
				this.managed[username].enable();
				this.conf.users[username].active = true;
				this.dispatchEvent("user", username);
			};
		};
	};
	async disable(username, noDisable) {
		if (!this.has(username)) {
			return;
		};
		if (!noDisable) {
			this.conf.users[username].enabled = false;
		};
		if (this.managed[username].active) {
			this.managed[username].disable();
			this.conf.users[username].active = false;
			this.dispatchEvent("user", username);
		};
	};
	async add(confObj, noActive) {
		let {acct, pass, otp} = confObj;
		if (this.has(acct)) {
			console.info(`[MultiMan]  Account ${username} already exists.`);
			return;
		};
		if (confObj.enabled == undefined) {
			confObj.enabled = true;
		};
		if (!this.conf.users[acct]) {
			this.conf.users[acct] = confObj;
		};
		if (!this.managed[acct]) {
			let e = new ManagedUser({
				username: confObj.acct,
				password: confObj.pass,
				otp: confObj.otp
			});
			e.monalisa = new Monalisa(e.fc);
			e.monalisa.cc = this.cc;
			e.monalisa.pg = this.pg;
			confObj.placed = confObj.placed || 0;
			let genericUpdate = async () => {
				let focusXY = e.monalisa.getFocus();
				confObj.focusX = focusXY.x;
				confObj.focusY = focusXY.y;
			};
			e.monalisa.addEventListener("pixelsuccess", async () => {
				confObj.pstate = 0;
				await genericUpdate;
				confObj.lastColour = e.monalisa.lastColour;
				confObj.nextAt = e.monalisa.nextAt || 0;
				confObj.placed ++;
				this.dispatchEvent("userupdate", acct);
			});
			e.monalisa.addEventListener("pixelwait", async () => {
				confObj.pstate = 4;
				await genericUpdate();
				this.dispatchEvent("userupdate", acct);
			});
			e.monalisa.addEventListener("pixelfocus", async () => {
				confObj.pstate = 3;
				await genericUpdate();
				this.dispatchEvent("userupdate", acct);
			});
			e.monalisa.addEventListener("pixelstart", async () => {
				confObj.pstate = 2;
				await genericUpdate();
				this.dispatchEvent("userupdate", acct);
			});
			e.monalisa.addEventListener("pixelfail", async () => {
				confObj.pstate = 0;
				confObj.nextAt = e.monalisa.nextAt || 0;
				await genericUpdate();
				this.dispatchEvent("userupdate", acct);
			});
			this.managed[acct] = e;
		};
		this.length ++;
		await this.selectActiveWs();
	};
	async remove(username) {
		let success = false;
		if (this.managed[username]) {
			this.managed[username].disable();
			delete this.managed[username];
			success = true;
		};
		if (this.conf.users[username]) {
			delete this.conf.users[username];
			success = true;
		};
		if (success) {
			this.length --;
		};
		await this.selectActiveWs();
	};
	async selectActiveWs() {
		// Disconnect WS if disabled/inactive
		if (this.activeWs && (!this.activeWs.active)) {
			console.info(`[MultiMan]  Stopping current WS stream as ${this.activeWs.username}...`);
			await this.activeWs.monalisa.stopStream();
			this.activeWs = undefined;
		};
		if (this.activeWs) {
			return;
		};
		// Automatically select a user to listen to WS streams
		for (let uname in this.managed) {
			let e = this.managed[uname];
			if (!this.activeWs) {
				if (e.active && !e.monalisa.wsActive && !(e.monalisa.ws?.readyState == 1)) {
					console.info(`[MultiMan]  Connecting to WS stream as ${e.username}...`);
					e.monalisa.startStream(true);
					this.activeWs = e;
				} else {
					//console.info(e);
				};
			};
		};
	};
	async rebuild() {
		//console.info(`[MultiMan]  Rebuilding requested.`);
		// Sync the managed object with the conf file
		for (let uname in this.managed) {
			if (!this.conf?.users[uname]) {
				delete this.managed[uname];
				console.info(`[MultiMan]  Account ${uname} removed upon rebuild.`);
			};
		};
		// Disable and remove users if they do not appear
		let activeCount = 0;
		//console.info(this.conf.users);
		for (let uname in this.conf.users) {
			let e = this.conf.users[uname];
			if (!this.managed[uname]) {
				console.info(`[MultiMan]  Account ${uname} added upon rebuild.`);
				await this.add(e);
			};
			let re = this.managed[uname];
			if (re.active) {
				activeCount ++;
			};
			if (e.enabled && !re.active) {
				if (activeCount < this.conf.magazine) {
					await this.enable(uname, true);
					activeCount ++;
				} else {
					await this.disable(uname, true);
				};
			} else if (!e.enabled && re.active) {
				await this.disable(uname);
				activeCount --;
			};
		};
		await this.selectActiveWs();
	};
	async sweep() {
		// Conduct a sweep cycle
		if (this.#sweeping) {
			console.info(`[MultiMan]  Sweeping cycle already ongoing.`);
			return;
		};
		this.#sweeping = true;
		for (let uname in this.managed) {
			let e = this.managed[uname];
			if (!e.active) {
				//console.info(`[MultiMan]  User ${uname} is not activated.`);
			} else if (Math.random() < this.getPower()) {
				//console.info(`[MultiMan]  User ${uname} is selected on sweep.`);
				(async () => {
					this.conf.users[uname].pstate = 1;
					this.dispatchEvent("userupdate", uname);
					await WingBlade.sleep(25, 4500);
					e.monalisa.place();
				})()
			} else {
				//console.info(`[MultiMan]  User ${uname} not selected.`);
			};
		};
		this.#sweeping = false;
	};
	async allOn() {
		for (let uname in this.conf.users) {
			await this.enable(uname);
		};
		await this.rebuild();
	};
	async allOff() {
		for (let uname in this.conf.users) {
			await this.disable(uname);
		};
		await this.rebuild();
	};
	async random() {
		for (let uname in this.managed) {
			let e = this.managed[uname];
			e.monalisa.focusPixel();
		};
		await this.rebuild();
	};
	constructor(conf) {
		super();
		this.conf = conf;
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
	let paintAnalytics;
	if (["paint", "pixel", "test", "batch"].indexOf(args[0]) > -1) {
		paintAnalytics = new Analytics('https://analytics.place.equestria.dev');
	};
	// If the painter starts
	let conf = {
		sensitivity: 4,
		magazine: 8,
		users: {}
	};
	let botPlaced = 0;
	switch (args[0]) {
		case "help": {
			// Show help
			switch (acct) {
				case "ctl": {
					console.info(`\nSet the server port with the optional PORT environment variable. 14514 by default.\n\nctl add    Add user credentials for management. OTP is optional\n             Example: ./palette-bot ctl add username password\n             Example: ./palette-bot ctl add username password otp\nctl del    Remove credentials of a user\n             Example: ./palette-bot ctl del username\nctl list   List all added users\nctl stat   Show available statistics\nctl on     Enable a managed user\nctl gon    Enable all managed users\nctl off    Disable a managed user\nctl goff   Disable all managed users\nctl user   Show available statuses for a managed user\nctl reset  Force random redistribution of focused points\nctl power  Set a power value between 1 and 0. Scaled by damage if blank\nctl scale  Set a sensitivity value equals to and greater than 0. Set to 1 if blank`);
					break;
				};
				default: {
					console.info(`help       Show this message\npaint      Use the provided credentials to paint on Reddit\n             Example: ./palette-bot paint username password\npixel      Use the provided credentials to paint on VKontakte\n             Example: ./palette-bot pixel username password\ntest       Use the provided credentials to paint on the test server\n             Example: ./palette-bot test sessionToken\nbatch      Start a server for managing. Reads and saves to a file. Port number is optional\n             Example: ./palette-bot batch 14514\nctl        Controls the painting server. Further help available\n`);
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
			console.info(`[Core]      Opening Reddit...`);
			// Initial Reddit browsing
			let browserContext = new FetchContext("https://www.reddit.com");
			await browserContext.fetch("https://www.reddit.com", {
				"init": "browser"
			});
			await WingBlade.sleep(1200, 1800);
			// Begin the Reddit auth flow
			console.info(`[Core]      Opening the login page...`);
			let redditAuth = new RedditAuth(browserContext);
			let authResult = await redditAuth.login(acct, pass, otp);
			if (!redditAuth.loggedIn) {
				// Error out
				console.info(`[Core]      Reddit login failed. Reason: ${authResult}`);
				WingBlade.exit(1);
			};
			// Start the painter
			//console.info(browserContext.cookies);
			//console.info(redditAuth.authInfo);
			console.info(`[Core]      Logged in as ${acct} (${redditAuth.userHash}).`);
			console.info(`Starting the painter...`);
			await logoutEverywhere(browserContext, redditAuth);
			if (!redditAuth.loggedIn) {
				console.info(`[Core]      Logged out from ${acct}.`);
			} else {
				console.info(`[Core]      Logout failed as ${acct}.`);
			};
			break;
		};
		case "pixel": {
			console.info(`[PixelGun]  This software is open-source. Interface and information related to VK is intact. Feel free to configure a build with VK support yourself.`);
			console.info(`[Пиксель]   Вы не заслуживаете, чтобы программист неустанно работал на вас.`);
			WingBlade.exit(1);
			break;
		};
		case "test": {
			await waitForProxy();
			console.info(`[Core]      Opening test server...`);
			// Initial test canvas browsing
			let browserContext = new FetchContext('https://place.equestria.dev');
			let paintGuide = new PaintGuide(svc.tpl);
			await browserContext.fetch('https://place.equestria.dev/');
			// Begin the test server auth flow
			console.info(`[Core]      Logging into the test server...`);
			let monalisa = new Monalisa(browserContext);
			monalisa.pg = paintGuide;
			let templateRefresher = async () => {
				paintGuide.updateTemplate();
			},
			templateThread = setInterval(templateRefresher, 30000);
			let rebuildPartitions = async () => {
				//await monalisa.partitionPixels();
				monalisa?.pp?.forEach((e, i) => {
					console.info(`[Core]      Canvas #${i} has ${e.length} points.`);
				});
				//monalisa.rebuildDamageCloud();
			};
			monalisa.addEventListener("canvasconfig", rebuildPartitions);
			paintGuide.addEventListener("templateupdate", rebuildPartitions);
			templateRefresher();
			let authResult = await monalisa.login({session: acct, fallback: pass, refresh: otp});
			if (!monalisa.loggedIn) {
				// Error out
				console.info(`[Core]      Monalisa login failed. Reason: ${authResult}`);
				WingBlade.exit(1);
			};
			console.info(`[Core]      Logged in as ${monalisa.session}. Receiving canvas config...`);
			await monalisa.refreshInfo();
			console.info(`[Core]      Cold start. Next pixel in ${(monalisa.nextAt - Date.now()) / 1000} seconds.`);
			await monalisa.startStream(true);
			console.info(`[Core]      Waiting for canvas configuration.`);
			await monalisa.whenCcReady();
			console.info(`[Core]      Waiting for pixel partitioning.`);
			await monalisa.whenPpReady();
			console.info(`[Core]      ${paintGuide.pixels} managed pixels in total.`);
			console.info(`[Core]      Waiting for canvas clouds and damage clouds.`);
			// Start the painter
			let power = 1;
			let keepRunning = true;
			monalisa.focusPixel();
			while (keepRunning) {
				let timeNow = Date.now();
				if (timeNow < monalisa.nextAt) {
					console.info(`[Core]      Still under cooldown. ${monalisa.nextAt - timeNow} seconds left.`);
				} else if (Math.random() < power) {
					console.info(`[Core]      Requesting pixel placing...`);
					await monalisa.getPixelHistory();
					await monalisa.place();
					//console.info(JSON.stringify());
					//let colourDesired = [WingBlade.randomInt(256), WingBlade.randomInt(256), WingBlade.randomInt(256)];
					//let colourPicked = monalisa.cc.colours.nearest(colourDesired);
					//console.info(`[Core]      Chose ${colourPicked} for ${colourDesired}.`);
					//let nextAt = await monalisa.placePixel(WingBlade.randomInt(10), 0, colourPicked[3]);
					//console.info(`[Core]      Next pixel in ${(nextAt - Date.now()) / 1000} seconds.`);
				} else {
					console.info(`[Core]      Bot waiting for the next sweep.`);
				};
				await WingBlade.sleep(5000);
			};
			break;
		};
		case "batch": {
			await waitForProxy();
			let runSince = Date.now();
			let systemBrowser = new FetchContext('https://place.equestria.dev');
			let paintGuide = new PaintGuide(svc.tpl);
			let templateRefresher = async () => {
				paintGuide.updateTemplate();
			},
			templateThread = setInterval(templateRefresher, 30000);
			templateRefresher();
			let confFile = `${parseInt(acct) || 14514}.json`;
			let socketStreams = [];
			let announceStream = function (json) {
				let serialized = JSON.stringify(json);
				socketStreams.forEach((e) => {
					e.send(serialized);
				});
			};
			console.info(`[Core]      Reading configuration data from "${confFile}".`);
			try {
				conf = JSON.parse(utf8Decode.decode(await WingBlade.readFile(confFile)));
				for (let user in conf.users) {
					if (conf.users[user].active?.constructor) {
						delete conf.users[user].active;
						delete conf.users[user].pstate; // 1 for focus, 2 for waiting, 0 for others
					};
				};
			} catch (err) {
				console.info(`[Core]      File read error: ${err}`);
				console.info(`[Core]      If you are running this for the first time, you can safely ignore the error above.`);
			};
			let fileSaver = async function () {
				console.info(`[Core]      Saving configuration file...`);
				await WingBlade.writeFile(confFile, utf8Encode.encode(JSON.stringify(conf)));
			},
			fileSaveThread = setInterval(fileSaver, 30000);
			fileSaver();
			let maman = new MultiUserManager(conf);
			maman.pg = paintGuide;
			let mamanSync = async () => {
				await maman.rebuild();
				for (let data in maman.managed) {
					announceStream({"event": "user", data});
				};
			},
			mamanThread = setInterval(mamanSync, 30000);
			await mamanSync();
			maman.addEventListener("user", ({data}) => {
				announceStream({"event": "user", data});
			});
			maman.addEventListener("userupdate", ({data}) => {
				announceStream({"event": "user", data});
			});
			let sweeper = async () => {
				await maman.sweep();
			},
			sweepThread = setInterval(sweeper, 5000);
			let ipInfo = new IPInfo();
			ipInfo.start();
			WingBlade.serve(async function (request) {
				let badRequest = new Response("Bad Request", {
					status: 400
				});
				let notFound = new Response("Not Found", {
					status: 404
				});
				let success = new Response("OK", {
					status: 200
				});
				let url = new URL(request.url);
				switch (request.method.toLowerCase()) {
					case "get": {
						switch (url.pathname) {
							case "/":
							case "/index.htm": {
								console.info(`[Core]      Web UI is opened. Welcome aboard, soldier!`);
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
								let acctStat = maman.getCounts();
								return new Response(JSON.stringify({
									plat: {
										var: `${WingBlade.variant} ${WingBlade.version}`,
										os: WingBlade.os
									},
									ver: BuildInfo.ver,
									ip: {
										ip: ipInfo.ip,
										cc: ipInfo.cc,
										asn: ipInfo.asn,
										as: ipInfo.as
									},
									acct: {
										total: maman.length,
										active: acctStat.active,
										enabled: acctStat.enabled,
										fresh: acctStat.fresh,
										banned: acctStat.banned
									},
									proxy: WingBlade.getEnv("HTTPS_PROXY") ? (WingBlade.getEnv("PROXY_PORT") ? (WingBlade.getEnv("LONGER_START") || "Standalone") : "System") : "No Proxy",
									mem: WingBlade.memUsed().rss,
									uptime: Date.now() - runSince,
									instance: paintAnalytics.uuid,
									bot: {
										sen: conf.sensitivity,
										pow: maman.getPower(),
										mag: conf.magazine,
										px: maman.getPlaced(),
										mpw: !!conf.power?.constructor
									},
									art: {
										px: paintGuide.pixels,
										ok: (paintGuide.points?.length || 0) - (maman.cc.damaged || 0)
									},
									ct: {
										w: maman.cc.width,
										h: maman.cc.height
									},
									cu: {
										w: maman.cc.uWidth,
										h: maman.cc.uHeight,
										s: maman.cc.cxy?.length || 0
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
									console.info(`[Core]      Web UI subscribed to realtime events.`);
									socket.send(JSON.stringify({"event": "init"}));
									socket.send(JSON.stringify({"event": "error", "data": `This version ${BuildInfo.ver} is a build dedicated for testing. Provided credentials are testing tokens, not Reddit credentials.\nIf you have already generated testing tokens, paste them in the account field, and hit "login" to add them for management.`}));
									socket.addEventListener("close", () => {
										console.info(`[Core]      Web UI disconnected from realtime events.`);
										socketStreams.splice(socketStreams.indexOf(socket), 1);
									});
									socketStreams.push(socket);
								});
								socket.addEventListener("close", () => {
									console.info("[Core]      WS closed.");
								});
								return response;
								break;
							};
							case "/user": {
								// Get users
								return new Response(JSON.stringify(conf.users));;
								break;
							};
							case "/redist": {
								// Force random redist
								await maman.random();
								return success;
								break;
							};
							case "/allOn": {
								// Force random redist
								await maman.allOn();
								return success;
								break;
							};
							case "/allOff": {
								// Force random redist
								await maman.allOff();
								return success;
								break;
							};
							default: {
								return notFound;
							};
						};
						break;
					};
					case "post": {
						switch (url.pathname) {
							case "/user": {
								// Add a user
								let json = await request.json();
								if (conf.users[json.acct]) {
									announceStream({"event": "error", "data": `Account "${json.acct}" already exists.`});
									return new Response("Already existed.", {
										status: 400
									});
								} else {
									await maman.add(json);
									announceStream({"event": "user", "data": json.acct});
									return success;
								};
								break;
							};
							case "/power": {
								// Set power
								let json = await request.json();
								if (json >= 0 && json <= 1) {
									conf.power = json;
									return success;
								} else {
									return badRequest;
								};
								break;
							};
							case "/sensitivity": {
								// Set power
								let json = await request.json();
								conf.sensitivity = json || 1;
								return success;
								break;
							};
							default: {
								return notFound;
							};
						};
						break;
					};
					case "put": {
						switch (url.pathname) {
							case "/user": {
								// Get a user
								let json = await request.text();
								if (conf.users[json]) {
									return new Response(JSON.stringify(conf.users[json]));
								} else {
									announceStream({"event": "error", "data": `Account "${json}" doesn't exist.`});
									return new Response("Doesn't exist.", {
										status: 400
									});
								};
								return success;
								break;
							};
							case "/on": {
								// Enable a user
								let json = await request.text();
								if (conf.users[json]) {
									maman.enable(json);
									return success;
								} else {
									announceStream({"event": "error", "data": `Account "${json}" doesn't exist.`});
									return new Response("Doesn't exist.", {
										status: 400
									});
								};
								break;
							};
							case "/off": {
								// Disable a user
								let json = await request.text();
								if (conf.users[json]) {
									maman.disable(json);
									return success;
								} else {
									announceStream({"event": "error", "data": `Account "${json}" doesn't exist.`});
									return new Response("Doesn't exist.", {
										status: 400
									});
								};
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
								let json = await request.text();
								if (conf.users[json]) {
									await maman.remove(json);
									announceStream({"event": "userdel", "data": json});
									return success;
								} else {
									announceStream({"event": "error", "data": `Account "${json}" doesn't exist.`});
									return new Response("Doesn't exist.", {
										status: 400
									});
								};
								break;
							};
							case "/power": {
								delete conf.power;
								return success;
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
					console.info(`[Core]      Now running in batch mode. To control and/or retrieve info from CLI, use the "ctl" subcommand.`);
					console.info(`[Core]      Web UI and REST API available on http://127.0.0.1:${port}/`);
					if (WingBlade.os.toLowerCase() == "windows") {
						console.info(`[Core]      Open the link above in your browser of choice, and start fighting, soldier!`);
					};
				}
			})
			break;
		};
		case "ctl": {
			let port = WingBlade.getEnv("PORT") || "14514";
			let prefix = `http://127.0.0.1:${port}/`;
			console.info(``);
			switch (acct) {
				case "info":
				case "stat": {
					let jsonData = await(await fetch (`${prefix}info`)).json();
					console.info(`IP Information\nProxy: ${jsonData.proxy}\nIP: ${jsonData.ip.ip}\nCountry: ${jsonData.ip.cc}\nASN: ${jsonData.ip.asn}\nAS: ${jsonData.ip.as}\n\nStatistics\nFinished: \nSensitivity: \nPower: \nAccounts: ${jsonData.acct?.sum}\nActive: \nMagazine: \nBanned: ${jsonData.acct?.banned}\nFresh: ${jsonData.acct?.fresh}\nPlaced Pixels: ${jsonData.placed}\nUptime: ${humanizedTime(jsonData.uptime / 1000)}`);
					break;
				};
				case "list": {
					let jsonData = await(await fetch (`${prefix}user`)).json();
					console.info(jsonData);
					break;
				};
				case "add": {
					console.info(await(await fetch (`${prefix}user`, {
						"method": "POST",
						"body": JSON.stringify({
							"acct": args[2],
							"pass": args[3],
							"otp": args[4] || "",
						})
					})).text());
					break;
				};
				case "del": {
					console.info(await(await fetch (`${prefix}user`, {
						"method": "DELETE",
						"body": args[2]
					})).text());
					break;
				};
				case "on": {
					console.info(await(await fetch (`${prefix}on`, {
						"method": "PUT",
						"body": args[2]
					})).text());
					break;
				};
				case "off": {
					console.info(await(await fetch (`${prefix}off`, {
						"method": "PUT",
						"body": args[2]
					})).text());
					break;
				};
				case "gon": {
					console.info(await(await fetch (`${prefix}allOn`)).text());
					break;
				};
				case "goff": {
					console.info(await(await fetch (`${prefix}allOff`)).text());
					break;
				};
				case "user": {
					console.info(await(await fetch (`${prefix}user`, {
						"method": "PUT",
						"body": args[2]
					})).json());
					break;
				};
				case "reset": {
					console.info(await(await fetch (`${prefix}redist`)).text());
					break;
				};
				case "power": {
					let value = JSON.parse(pass || "-1");
					if (value <= 1 && value >= 0) {
						console.info(await(await fetch (`${prefix}power`, {
							"method": "POST",
							"body": `${value}`
						})).text());
					} else {
						console.info(await(await fetch (`${prefix}power`, {
							"method": "DELETE"
						})).text());
					};
					break;
				};
				case "scale": {
					console.info(await(await fetch (`${prefix}sensitivity`, {
						"method": "POST",
						"body": args[2] || "1"
					})).text());
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
