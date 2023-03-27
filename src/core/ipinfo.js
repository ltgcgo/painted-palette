"use strict";

import {FetchContext} from "./fetchContext.js";

const remotes = ["https://ifconfig.me/ip", "https://ipecho.net/plain"];

let IPInfo = class {
	#fc = new FetchContext();
	#monitorThread = 0;
	#infoIp = "127.0.0.1";
	ip = "127.0.0.1";
	cc = "UN";
	asn = 0;
	as = "Invalid ASN";
	start() {
		let upThis = this;
		this.#monitorThread = setInterval(() => {
			upThis.grab();
		}, 20000);
		upThis.grab();
	};
	stop() {
		clearInterval(this.#monitorThread);
		this.#monitorThread = 0;
	};
	async grab() {
		// Fetch
		let ipAddress = "127.0.0.1";
		try {
			ipAddress = (await (await this.#fc.fetch(remotes[WingBlade.randomInt(remotes.length)])).text()).replaceAll("\n", "").trim();
		} catch (err) {
			console.info(`IP address fetch failed. ${err}`);
		};
		if (this.#infoIp != ipAddress && ipAddress != "127.0.0.1" && ipAddress != this.ip) {
			console.info(`IP address updated to: ${ipAddress}`);
			this.ip = ipAddress;
			let ipInfo;
			try {
				let ipsb = await this.#fc.fetch(`https://api.ip.sb/geoip/${ipAddress}`);
				if (ipsb.status == 200) {
					let ipInfo = await ipsb.json();
					this.asn = ipInfo.asn || 0;
					this.as = ipInfo.isp || ipInfo.asn_organization || "Invalid ASN";
					this.cc = ipInfo.country_code || ipInfo.region_code || "UN";
				} else {
					// Fetch information from BGPView
					let ipInfo = (await(await this.#fc.fetch(`https://api.bgpview.io/ip/${ipAddress}`)).json()).data;
					// Extract AS information
					ipInfo.prefixes.sort((a, b) => {
						return b.cidr - a.cidr;
					});
					this.asn = ipInfo.prefixes[0]?.asn.asn || 0;
					this.as = ipInfo.prefixes[0]?.asn.description || "Invalid ASN";
					// Extract country code
					if (ipInfo.maxmind.country_code) {
						this.cc = ipInfo.maxmind.country_code;
					} else {
						this.cc = ipInfo.prefixes[0].country_code;
					};
					this.#infoIp = ipAddress;
				};
				//console.info(this);
			} catch (err) {};
		} else {
			//console.info(`IP address still on: ${ipAddress}`);
		};
	};
	constructor() {
	};
};

export {
	IPInfo
};
