"use strict";

import {FetchContext} from "./fetchContext.js";

//const remotes = ["https://ifconfig.me/ip", "https://ipecho.net/plain", "https://ip4.seeip.org", "https://api4.my-ip.io/ip.txt"];
// unusable "https://ip.seeip.org"
const remotes = ["https://ifconfig.me/ip", "https://ipecho.net/plain", "https://ifconfig.co/ip", "https://icanhazip.com/", "https://api.ipify.org/", "https://ipapi.co/ip", "https://api.my-ip.io/ip.txt", "https://api.ip.sb/ip"];

let IPInfo = class {
	#fc = new FetchContext();
	#monitorThread = 0;
	#infoIp = "127.0.0.1";
	#cache = {};
	ip = "127.0.0.1";
	cc = "UN";
	asn = 0;
	as = "Invalid ASN";
	start() {
		let upThis = this;
		this.#monitorThread = setInterval(() => {
			upThis.grab();
		}, 30000);
		upThis.grab();
	};
	stop() {
		clearInterval(this.#monitorThread);
		this.#monitorThread = 0;
	};
	async grab() {
		// Spaghetti code ahead!!!
		// Fetch
		let ipAddress = "127.0.0.1";
		try {
			let ipRep = await this.#fc.fetch(remotes[WingBlade.util.randomInt(remotes.length)]);
			if (ipRep.status > 299) {
				throw(new Error(`${ipRep.status} ${ipRep.statusText}`));
			};
			ipAddress = (await ipRep.text()).replaceAll("\n", "").trim();
		} catch (err) {
			console.info(`[IPInfo]    IP address fetch failed. ${err}`);
		};
		if (this.#infoIp != ipAddress && ipAddress != "127.0.0.1") {
			console.info(`[IPInfo]    IP address updated to: ${ipAddress}`);
			this.ip = ipAddress;
			if (this.#cache[ipAddress]) {
				let cached = this.#cache[ipAddress];
				this.asn = cached.asn;
				this.as = cached.as;
				this.cc = cached.cc;
				this.#infoIp = ipAddress;
				console.info(`[IPInfo]    Served GeoIP info from cache.`);
				return;
			};
			let ipInfo;
			try {
				let ipsb = await this.#fc.fetch(`https://api.ip.sb/geoip/${ipAddress}`);
				if (ipsb.status == 200) {
					let ipInfo = await ipsb.json();
					this.asn = ipInfo.asn || 0;
					this.as = ipInfo.isp || ipInfo.asn_organization || "Invalid ASN";
					this.cc = ipInfo.country_code || ipInfo.region_code || "UN";
					if (this.asn) {
						this.#infoIp = ipAddress;
						if (!this.#cache[ipAddress]) {
							this.#cache[ipAddress] = {
								asn: this.asn,
								as: this.as,
								cc: this.cc
							};
						};
					} else {
						this.#infoIp = "0.0.0.0";
					};
				} else {
					console.info(`[IPInfo]    Blocked from IP.SB. Switchting to BGPView...`);
					// Fetch information from BGPView
					let ipsb = await this.#fc.fetch(`https://api.bgpview.io/ip/${ipAddress}`);
					if (ipsb.status == 200) {
						let ipInfo = (await ipsb.json()).data;
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
						if (this.asn) {
							this.#infoIp = ipAddress;
							if (!this.#cache[ipAddress]) {
								this.#cache[ipAddress] = {
									asn: this.asn,
									as: this.as,
									cc: this.cc
								};
							};
						} else {
							this.#infoIp = "0.0.0.0";
						};
					} else {
						console.info(`[IPInfo]    Blocked from BGPView. Switchting to IPAPI.co...`);
						let ipsb = await this.#fc.fetch(`https://ipapi.co/json/`);
						if (ipsb.status == 200) {
							let ipInfo = await ipsb.json();
							this.asn = parseInt(ipInfo.asn.replace("AS", "")) || 0;
							this.as = ipInfo.org || "Invalid AS";
							this.cc = ipInfo.country_code || ipInfo.country || "UN";
							if (this.asn) {
								this.#infoIp = ipAddress;
								if (!this.#cache[ipAddress]) {
									this.#cache[ipAddress] = {
										asn: this.asn,
										as: this.as,
										cc: this.cc
									};
								};
							} else {
								this.#infoIp = "0.0.0.0";
							};
						} else {
							console.info(`[IPInfo]    Blocked from IPAPI.co. Switchting to IPGeolocation...`);
							let ipsb = await this.#fc.fetch(`https://api.ipgeolocation.io/ipgeo?include=hostname&ip=${ipAddress}`, {
								"headers": {
									"Origin": "https://ipgeolocation.io",
									"Referer": "https://ipgeolocation.io/",
									"Accept": "application/json"
								}
							});
							if (ipsb.status == 200) {
								let ipInfo = await ipsb.json();
								this.asn = parseInt(ipInfo.asn.replace("AS", "")) || 0;
								this.as = ipInfo.isp || ipInfo.organization || "Invalid AS";
								this.cc = ipInfo.country_code2 || "UN";
								if (this.asn) {
									this.#infoIp = ipAddress;
									if (!this.#cache[ipAddress]) {
										this.#cache[ipAddress] = {
											asn: this.asn,
											as: this.as,
											cc: this.cc
										};
									};
								} else {
									this.#infoIp = "0.0.0.0";
								};
							} else {
								console.info(`[IPInfo]    Blocked from IPGeolocation. Switchting to IPAPI.com...`);
								let ipsb = await this.#fc.fetch(`https://ipapi.com/ip_api.php?ip=${ipAddress}`);
								if (ipsb.status == 200) {
									let ipInfo = (await ipsb.json()).data;
									this.asn = ipInfo.connection.asn || 0;
									this.as = ipInfo.connection.isp || "Invalid AS";
									this.cc = ipInfo.country_code || "UN";
									if (this.asn) {
										this.#infoIp = ipAddress;
										if (!this.#cache[ipAddress]) {
											this.#cache[ipAddress] = {
												asn: this.asn,
												as: this.as,
												cc: this.cc
											};
										};
									} else {
										this.#infoIp = "0.0.0.0";
									};
								} else {
									console.info(`[IPInfo]    Blocked from IPAPI.com.`);
								};
							};
						};
					};
				};
				//console.info(this);
			} catch (err) {
				console.error(`[IPInfo]    GeoIP service failed: ${err}`);
			};
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
