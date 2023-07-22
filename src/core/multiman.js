"use strict";

import {FetchContext} from "./fetchContext.js";
import {Monalisa} from "./monalisa.js";
import {Analytics} from "./analytics.js";
import {PaintGuide} from "./paintGuide.js";
import {RedditAuth} from "./redditAuth.js";

import {CustomEventSource} from "../../libs/lightfelt/ext/customEvents.js";

const batchModeOrigin = 'https://gql-realtime-2.reddit.com';

let ManagedUser = class extends CustomEventSource {
	#shouldActivate = false;
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
		this.#shouldActivate = true;
		console.info("[MultiMan]  Opening Reddit...");
		await this.fc.fetch("https://www.reddit.com/", {
			"init": "browser"
		});
		console.info(`[MultiMan]  Logging in as ${this.username}...`);
		await this.redditAuth.login(this.username, this.password, this.otp);
		if (!this.redditAuth.loggedIn) {
			console.info(`[MultiMan]  Login failed as ${this.username}. Retrying in 5 seconds.`);
			this.active = false;
			let upThis = this;
			// Temporary fix for login issues
			setTimeout(() => {
				if (upThis.#shouldActivate) {
					console.info(`[MultiMan]  Login attempt as ${this.username} reinitiated.`);
					this.enable();
				};
			}, 5000);
			return;
		};
		let rplaceTokenReq = await this.fc.fetch("https://www.reddit.com/r/place/?screenmode=fullscreen");
		let rplaceToken;
		if (rplaceTokenReq.status < 300) {
			rplaceToken = await rplaceTokenReq.text();
			rplaceToken = rplaceToken.slice(rplaceToken.indexOf("\"accessToken\":\"") + 15);
			rplaceToken = rplaceToken.slice(0, rplaceToken.indexOf("\""));
			//console.debug(rplaceToken);
		};
		await this.monalisa.login({
			session: rplaceToken
		});
		//this.monalisa.setSession(this.username);
		this.active = true;
		return;
	};
	async disable() {
		this.#shouldActivate = false;
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
	an; // Attach analytics
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
	async setSnooze() {
		this.conf.snooze = true;
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
			e.redditAuth = new RedditAuth(e.fc);
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
				await genericUpdate();
				confObj.lastColour = e.monalisa.lastColour;
				confObj.nextAt = e.monalisa.nextAt || 0;
				confObj.placed ++;
				this.an?.botPlacement({
					x: confObj.focusX,
					y: confObj.focusY,
					color: e.monalisa.colourIndex,
					reddit: e.monalisa.nextAt
				});
				this.an?.sendError("PALETTE_PIXEL_CONTRIBUTE");
				this.dispatchEvent("userupdate", acct);
			});
			e.monalisa.addEventListener("pixelban", async () => {
				confObj.pstate = 0;
				await genericUpdate();
				confObj.nextAt = e.monalisa.nextAt || 0;
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
	async magazine() {
		// Handle account enabling and disabling
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
	async sweep(manual = false) {
		// Conduct a sweep cycle
		if (!this.conf.snooze && !manual) {
			//console.info(`[MultiMan]  Automatic placement disabled.`);
			return;
		};
		if (this.#sweeping) {
			console.info(`[MultiMan]  Sweeping cycle already ongoing.`);
			return;
		};
		this.#sweeping = true;
		for (let uname in this.managed) {
			let e = this.managed[uname];
			if (!e.active) {
				//console.info(`[MultiMan]  User ${uname} is not activated.`);
			} else if (manual || Math.random() < this.getPower()) {
				//console.info(`[MultiMan]  User ${uname} is selected on sweep.`);
				(async () => {
					this.conf.users[uname].pstate = 1;
					this.dispatchEvent("userupdate", uname);
					await WingBlade.util.sleep(25, 4500);
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
			await WingBlade.util.sleep(2500);
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
		this.setSnooze();
	};
};

export {
	ManagedUser,
	MultiUserManager
};
