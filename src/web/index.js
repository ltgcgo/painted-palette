// Only place minimized files here
"use strict";

// Import common values
import {BuildInfo} from "../core/common.js";

// Initialize Alpine
import {} from "../../libs/alpinejs/alpine.js";

let infoThread = 0;

// Some serious work
document.addEventListener("alpine:init", () => {
	Alpine.store("buildInfo", BuildInfo);
	infoThread = setInterval(async () => {
		let data = await (await fetch("/info")).json();
		Alpine.store("info", {
			ip: data.ip.ip || "127.0.0.1",
			cc: data.ip.cc || "UN",
			asn: data.ip.asn || 0,
			as: data.ip.as || "Invalid ASN",
			proxy: data.proxy
		});
	}, 5000);
});
