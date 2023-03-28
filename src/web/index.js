// Only place minimized files here
"use strict";

// Import common values
import {BuildInfo, humanizedTime, humanizedPercentage} from "../core/common.js";

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
			sensitivity: humanizedPercentage(data.bot.sen),
			maxOn: data.bot.mag,
			pixels: data.bot.px,
			power: humanizedPercentage(data.bot.pow),
			ctw: data.ct?.w,
			cth: data.ct?.h,
			cuw: data.cu?.w,
			cuh: data.cu?.h,
			cus: data.cu?.s,
			pxOk: data.art.ok,
			pxAll: data.art.px,
			pxRate: humanizedPercentage(data.art.ok / data.art.px)
		});
	}, 5000);
	subSecondTask = setInterval(async () => {
		Alpine.store("sessionUptime", runSince ? humanizedTime((Date.now() - runSince) / 1000) : "Waiting for data...");
	}, 10);
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
		console.info("WebSocket connecting...");
		eventStream = new WebSocket(`ws://${location.host}/events`);
		eventStream.addEventListener("message", async function (ev) {
			let {data} = ev;
			data = JSON.parse(data);
			switch (data.event) {
				case "init": {
					userAddLock = true;
					console.info("WebSocket connected.");
					break;
				};
				case "user": {
					let userData = await (await fetch("/user", {
						"method": "PUT",
						"body": data.data
					})).json();
					if (userIndex[data.data]?.constructor != Number) {
						userMan.push({
							acct: data.data.slice(0, 20),
							name: data.data
						});
						rebuildAcctIndex();
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
			console.info("WebSocket disconnected. Retrying in seconds.");
			setTimeout(eventTapper, 2000);
		});
	};
	eventTapper();
	fetch("/user").then((r) => {return r.json()}).then((json) => {
		for (let name in json) {
			let e = json[name];
			userMan.push({
				acct: e.acct.slice(0, 20),
				name: e.acct
			});
		};
		rebuildAcctIndex();
	});
	self.delUser = (name) => {
		fetch("/user", {
			"method": "DELETE",
			"body": name
		});
	};
});
