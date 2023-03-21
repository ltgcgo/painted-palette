// Creating fetches with a context.

"use strict";

let FetchContext = class {
	origin;
	referer;
	globalHeaders = {
		"Accept": "*/*",
		"User-Agent": /*"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"*/"Mozilla/5.0 (Windows NT 10.0; rv:102.0) Gecko/20100101 Firefox/102.0",
		"Accept-Language": "en-US,en-GB;q=0.9,en;q=0.8",
		/*"Sec-CH-UA": `Sec-CH-UA: " Not A;Brand";v="99", "Chromium";v="108", "Google Chrome";v="108"`,
		"Sec-CH-UA-Mobile": "?0",
		"Sec-CH-UA-Platform": "Windows",*/
		"Sec-Fetch-Dest": "empty",
		"Sec-Fetch-Mode": "cors",
		"Sec-Fetch-Site": "same-origin",
		"Upgrade-Insecure-Requests": "1",
		"DNT": "1"
	};
	cookies = {};
	async fetch(url, opt = {}) {
		opt.headers = opt?.headers || {};
		for (let header in this.globalHeaders) {
			opt.headers[header] = this.globalHeaders[header];
		};
		if (this.origin) {
			opt.headers["Origin"] = this.origin;
		};
		if (this.referer) {
			opt.headers["Referer"] = this.referer;
		};
		switch (opt.init) {
			case "browser": {
				opt.headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
				opt.headers["Sec-Fetch-Dest"] = "document";
				opt.headers["Sec-Fetch-Mode"] = "navigate";
				opt.headers["Sec-Fetch-Site"] = "none";
				opt.headers["Sec-Fetch-User"] = "?1";
				break;
			};
		};
		let cookieArr = [];
		for (let cookieKey in this.cookies) {
			if (this.cookies[cookieKey]?.length) {
				cookieArr.push(`${cookieKey}=${this.cookies[cookieKey]}`);
			};
		};
		if (cookieArr.length) {
			opt.headers["Cookie"] = cookieArr.join("; ");
		};
		//opt.credentials = opt.credentials || "include";
		//opt.redirect = opt.redirect || "follow";
		//console.info(opt);
		let retry = 5, keepGoing = true;
		let response;
		while (retry && keepGoing) {
			retry --;
			try {
				response = await fetch(url, opt);
				keepGoing = false;
				console.error(`Fetch success.`);
			} catch (err) {
				console.error(`Fetch failed.`);
			};
		};
		response?.headers.forEach((v, k) => {
			if (k.toLowerCase() == "set-cookie") {
				let assigner = v.split(";")[0].split("=");
				this.cookies[assigner[0]] = assigner[1];
			};
		});
		return response;
	};
	constructor(origin) {
		this.origin = origin;
	};
};

export {
	FetchContext
};