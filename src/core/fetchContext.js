// Creating fetches with a context.

"use strict";

const contexts = {
	"browser": "Browser navigation"
};

let textToObj = function (str) {
	let newObj = {};
	str.split("\n").forEach((e) => {
		if (e.trim().length) {
			let fields = e.split("\t");
			if (self.Bun && fields[0] == "Accept-Encoding") {
				console.debug(`Eliminated headers for Bun.`);
			} else {
				newObj[fields[0]] = fields[1];
			};
		};
	});
	return newObj;
};
const browserHeaders = [textToObj(`User-Agent	Mozilla/5.0 (Windows NT 10.0; rv:102.0) Gecko/20100101 Firefox/102.0
Accept	text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8
Accept-Language	en-US,en;q=0.9
Accept-Encoding	gzip, deflate, br
DNT	1
Upgrade-Insecure-Requests	1
Sec-Fetch-Dest	empty
Sec-Fetch-Mode	cors
Sec-Fetch-Site	same-origin
Sec-Fetch-User	?1`), textToObj(`Sec-CH-UA	"Microsoft Edge";v="111", "Not(A:Brand";v="8", "Chromium";v="111"
Sec-CH-UA-Mobile	?0
Sec-CH-UA-Platform	"Windows"
Upgrade-Insecure-Requests	1
User-Agent	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.51
Accept	text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site	same-origin
Sec-Fetch-Mode	cors
Sec-Fetch-User	?1
Sec-Fetch-Dest	empty
Accept-Encoding	gzip, deflate, br
Accept-Language	en-US,en;q=0.9`), textToObj(`Upgrade-Insecure-Requests	1
User-Agent	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36
Accept	text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site	same-origin
Sec-Fetch-Mode	cors
Sec-Fetch-User	?1
Sec-Fetch-Dest	empty
Sec-CH-UA	"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"
Sec-CH-UA-Mobile	?0
Sec-CH-UA-Platform	"Windows"
Accept-Encoding	gzip, deflate, br
Accept-Language	en-US,en;q=0.9`)];
let getBrowserHeaders = function () {
	let chosenIndex = Math.floor(Math.random() * 9);
	if (chosenIndex > 2) {
		chosenIndex = 2;
	};
	return browserHeaders[chosenIndex];
};

let FetchContext = class extends EventTarget {
	#concurrency = 0;
	#fire(type) {
		this.dispatchEvent(new Event(type));
	};
	get concurrency() {
		// Expose the count of currently active connections.
		return this.#concurrency;
	};
	origin;
	referer;
	globalHeaders = getBrowserHeaders();
	cookies = {};
	allFinish() {
		let upThis = this;
		return new Promise((accept, reject) => {
			if (this.#concurrency < 1) {
				accept();
			} else {
				upThis.addEventListener("concurrency", () => {
					if (upThis.#concurrency < 1) {
						accept();
					};
				});
			};
		});
	};
	async fetch(url, opt = {}) {
		opt.headers = opt?.headers || {};
		for (let header in this.globalHeaders) {
			opt.headers[header] = opt.headers[header] || this.globalHeaders[header];
		};
		if (this.origin && !opt.headers["Origin"]) {
			opt.headers["Origin"] = this.origin;
		};
		if (this.referer && !opt.headers["Referer"]) {
			opt.headers["Referer"] = this.referer;
		};
		if (!opt.credentials) {
			opt.credentials == "omit";
		};
		if (self.Bun) {
			console.debug(`Enabled runtime fetch verbose logging for Bun.`);
			//opt.verbose = true;
		};
		switch (opt.init) {
			case "browser": {
				opt.headers["Sec-Fetch-Dest"] = "document";
				opt.headers["Sec-Fetch-Mode"] = "navigate";
				//opt.headers["Sec-Fetch-Site"] = "none";
				//opt.headers["Sec-Fetch-User"] = "?1";
				break;
			};
			default: {
				opt.headers["Accept"] = "*/*";
				delete opt.headers["Sec-Fetch-User"];
			};
		};
		if (!opt.noCookies) {
			let cookieArr = [];
			for (let cookieKey in this.cookies) {
				if (this.cookies[cookieKey]?.length) {
					cookieArr.push(`${cookieKey}=${this.cookies[cookieKey]}`);
				};
			};
			if (cookieArr.length) {
				opt.headers["Cookie"] = cookieArr.join("; ");
			};
		};
		//opt.credentials = opt.credentials || "include";
		//opt.redirect = opt.redirect || "follow";
		//console.info(opt);
		//console.info(`[BrowseCxt] Request: ${opt?.method?.toUpperCase() || "GET"} ${url}`);
		let retryMax = 3, retry = retryMax, keepGoing = true;
		let response;
		let requestType = `${opt?.method?.toUpperCase() || "GET"} ${url}`;
		while (retry && keepGoing) {
			retry --;
			try {
				this.#concurrency ++;
				this.#fire("concurrency");
				if (!opt.oneshot) {
					console.info(`[BrowseCxt] ${requestType}`);
				};
				/*if (url.indexOf("query") > -1 && opt.method.toLowerCase() == "post") {
					console.info(opt);
				};*/
				response = await fetch(url, opt);
				this.#concurrency --;
				this.#fire("concurrency");
				keepGoing = false;
				if (!opt.oneshot) {
					console.info(`[BrowseCxt] ${requestType}: ${response.status} ${response.statusText}`);
				};
				if (retry < retryMax - 1) {
					console.info(`[BrowseCxt] ${contexts[opt.init] || "Fetch"} success.`);
				};
			} catch (err) {
				this.#concurrency --;
				this.#fire("concurrency");
				if (opt.oneshot) {
					retry = 0;
				};
				console.error(`[BrowseCxt] ${contexts[opt.init] || "Fetch"} failed (${requestType}).${retry ? " Retrying..." : ""}\n${err}`);
				if (retry) {
					await WingBlade.util.sleep(2000);
				};
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
	async ws(url, protos) {
		return new WebSocket(url, protos);
	};
	constructor(origin) {
		super();
		this.origin = origin;
	};
};

export {
	FetchContext
};
