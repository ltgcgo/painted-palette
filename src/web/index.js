// Only place minimized files here
"use strict";

// Import common values
import {BuildInfo, humanizedTime} from "../core/common.js";

// Initialize Alpine
import {} from "../../libs/alpinejs/alpine.js";

let infoThread = 0;
let subSecondTask = 0;
let slowSubTask = 0;

// Some serious work
document.addEventListener("alpine:init", () => {
	let users = [];
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
			os: data.plat.os || "HorseOS"
		});
	}, 5000);
	subSecondTask = setInterval(async () => {
		Alpine.store("sessionUptime", runSince ? humanizedTime((Date.now() - runSince) / 1000) : "Waiting for data...");
	}, 40);
	slowSubTask = setInterval(async () => {
		//
	}, 500);
});
