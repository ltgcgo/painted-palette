// Only place minimized files here
"use strict";

// Import common values
import {
	BuildInfo,
	humanizedTime,
	humanizedSize,
	humanizedPercentage
} from "../core/common.js";

// Initialize Alpine
import {} from "../../libs/alpinejs/alpine.js";

let infoThread = 0;
let subSecondTask = 0;
let slowSubTask = 0;

let $e = function (selector, source = document) {
	return source.querySelector(selector);
};

// Some serious work
document.addEventListener("alpine:init", () => {
	let users = [], userIndex = {};
	Alpine.store("buildInfo", BuildInfo);
	Alpine.store("userdata", users);
	Alpine.store("wsConnected", 0);
	let userMan = Alpine.store("userdata");
	let runSince = 0;
	infoThread = setInterval(async () => {
		let data = await (await fetch("/info")).json();
		runSince = Date.now() - data.uptime;
		Alpine.store("info", {
			ip: data.ip.ip || "127.0.0.1",
			cc: data.ip.cc || "UN",
			asn: data.ip.asn || 0,
			as: data.ip.as || "Invalid ASN",
			proxy: data.proxy,
			var: data.plat.var || "HorseJS",
			os: data.plat.os || "HorseOS",
			ver: data.ver || "0.0.0",
			sensitivity: humanizedPercentage(data.bot.sen),
			maxOn: data.bot.mag,
			pixels: data.bot.px,
			power: humanizedPercentage(data.bot.pow),
			manualPower: data.bot.mpw,
			instance: data.instance,
			memory: humanizedSize(data.mem),
			acct: data.acct.total,
			active: data.acct.active,
			banned: data.acct.banned,
			fresh: data.acct.fresh,
			ctw: data.ct?.w,
			cth: data.ct?.h,
			cuw: data.cu?.w,
			cuh: data.cu?.h,
			cus: data.cu?.s,
			pxOk: data.art.ok,
			pxNo: data.art.px - data.art.ok,
			pxAll: data.art.px,
			pxRate: humanizedPercentage(data.art.ok / data.art.px),
			snoozeMode: data.snooze
		});
	}, 5000);
	subSecondTask = setInterval(async () => {
		Alpine.store("sessionUptime", runSince ? humanizedTime((Date.now() - runSince) / 1000) : "Waiting for data...");
		let userArr = Alpine.store("userdata");
		let timeNow = Date.now();
		userArr.forEach((e, i) => {
			if (e.banned) {
				userArr[i].stateText = `Banned`;
			} else if (!e.enabled) {
				userArr[i].stateText = `Disabled`;
			} else if (!e.active) {
				userArr[i].stateText = `Inactive`;
			} else {
				let timeDiff = (e.nextAt || 0) - timeNow;
				if (timeDiff <= 0) {
					userArr[i].stateText = [`Standby`, `Selected`, `Focus`, `Placing`][e.pstate || 0] || `Unknown state`;
				} else {
					timeDiff = Math.ceil(timeDiff / 100) / 10;
					userArr[i].stateText = `${Math.floor(timeDiff)}.${Math.floor(timeDiff * 10 % 10)} s`;
				};
			};
		});
	}, 100);
	slowSubTask = setInterval(async () => {
		//
	}, 500);
	let userAddLock = false;
	let userAddBtn = $e("#btn-add");
	userAddBtn.addEventListener("click", async function (ev) {
		if (userAddLock) {
			$e("#in-acct").disabled = true;
			$e("#in-pass").disabled = true;
			$e("#in-otp").disabled = true;
			this.disabled = true;
			await fetch(`/user`, {
				"method": "POST",
				"body": JSON.stringify({
					"acct": $e("#in-acct").value,
					"pass": $e("#in-pass").value,
					"otp": $e("#in-otp").value
				})
			});
			$e("#in-acct").disabled = false;
			$e("#in-acct").value = "";
			$e("#in-pass").disabled = false;
			$e("#in-pass").value = "";
			$e("#in-otp").disabled = false;
			$e("#in-otp").value = "";
			userAddBtn.disabled = false;
		};
	});
	let rebuildAcctIndex = function () {
		userMan.forEach((e, i) => {
			userIndex[e.name] = i;
		});
	};
	let eventStream,
	eventTapper = function () {
		Alpine.store("wsConnected", 1);
		console.info("WebSocket connecting...");
		eventStream = new WebSocket(`ws://${location.host}/events`);
		eventStream.addEventListener("open", () => {
			console.info("WebSocket connected.");
		});
		eventStream.addEventListener("message", async function (ev) {
			let {data} = ev;
			data = JSON.parse(data);
			switch (data.event) {
				case "init": {
					userAddLock = true;
					Alpine.store("wsConnected", 2);
					fetch("/user").then((r) => {return r.json()}).then((json) => {
						while (userMan.length > 0) {
							userMan.pop();
						};
						for (let name in json) {
							let e = json[name];
							//console.info(e);
							userMan.push({
								acct: e.acct.slice(0, 32),
								name: e.acct,
								active: e.active
							});
						};
						rebuildAcctIndex();
					});
					break;
				};
				case "user": {
					let userData = await (await fetch("/user", {
						"method": "PUT",
						"body": data.data
					})).json();
					if (userIndex[data.data]?.constructor != Number) {
						//console.info(userData);
						userMan.push({
							acct: data.data.slice(0, 32),
							name: data.data,
							enabled: userData.enabled,
							active: userData.active,
							banned: userData.banned,
							focusX: userData.focusX,
							focusY: userData.focusY,
							lastColour: userData.lastColour,
							placed: userData.placed,
							nextAt: userData.nextAt,
							pstate: userData.pstate,
							confirm: userData.confirm,
							nfp: userData.nfp,
							nfn: userData.nfn
						});
						rebuildAcctIndex();
					} else {
						let e = userMan[userIndex[data.data]];
						//console.info(userData);
						e.enabled = userData.enabled;
						e.active = userData.active;
						e.banned = userData.banned;
						e.focusX = userData.focusX;
						e.focusY = userData.focusY;
						e.lastColour = userData.lastColour;
						e.placed = userData.placed;
						e.nextAt = userData.nextAt;
						e.pstate = userData.pstate;
						e.confirm = userData.confirm;
						e.nfp = userData.nfp;
						e.nfn = userData.nfn;
					};
					let manipulator = userMan[userIndex[data.data]];
					break;
				};
				case "userdel": {
					userMan.splice(userIndex[data.data], 1);
					delete userIndex[data.data];
					rebuildAcctIndex();
					break;
				};
				case "error": {
					alert(data.data || "An error occurred.");
					break;
				};
				default: {
					console.debug(data);
				};
			};
		});
		eventStream.addEventListener("close", function () {
			userAddLock = false;
			Alpine.store("wsConnected", 0);
			console.info("WebSocket disconnected. Retrying in seconds.");
			setTimeout(eventTapper, 5000);
		});
	};
	eventTapper();
	self.delUser = (name) => {
		fetch("/user", {
			"method": "DELETE",
			"body": name
		});
	};
	self.pSet = (power) => {
		if (power < 0 || power > 1) {
			fetch("/power", {
				"method": "DELETE"
			});
			return;
		};
		fetch("/power", {
			"method": "POST",
			"body": power
		});
	};
	self.randDist = () => {
		fetch("/redist");
	};
	self.gAct = (action) => {
		fetch(action ? "/allOn" : "/allOff");
	};
	self.gMaes = (maes) => {
		if (maes > 4) {
			fetch("/sleep");
		};
	};
	self.gPaint = () => {
		fetch("/paint");
	};
	self.uOn = (name) => {
		fetch("/on", {
			"method": "PUT",
			"body": name
		});
	};
	self.uOff = (name) => {
		fetch("/off", {
			"method": "PUT",
			"body": name
		});
	};
});
