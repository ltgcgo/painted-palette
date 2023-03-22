// Copyright (c) Lightingale Flame Author(s) 2023.
// Licensed under GNU AGPL 3.0.

"use strict";

let WingBlade = {
	args: process.argv.slice(2),
	os: os.platform(),
	variant: "Node",
	exit: (code = 0) => {
		process.exit(code);
	},
	getEnv: (key, fallbackValue) => {
		return process.env[key] || fallbackValue;
	},
	serve: (handler, opt = {}) => {
		let port = opt.port || 8000;
		let hostname = opt.hostname || "127.0.0.1";
		let server = http.createServer(async function (requester, responder) {
			let readStreamController;
			let bodyStream = new ReadableStream({
				type: "bytes",
				start: (controller) => {
					readStreamController = controller;
				},
				cancel: (reason) => {},
				autoAllocateChunkSize: 65536
			});
			let reqOpt = {
				"method": requester.method,
				"headers": requester.headers
			};
			let bodyUsed = ["GET", "HEAD"].indexOf(reqOpt.method) == -1;
			requester.on("data", (chunk) => {
				readStreamController.enqueue(chunk);
			}).on("end", () => {
				readStreamController.close();
			});
			if (bodyUsed) {
				reqOpt.body = bodyStream;
				reqOpt.duplex = "half";
			};
			let request = new Request(`${requester.headers["x-forwarded-proto"] || "http"}://${requester.headers.host}${requester.url}`, reqOpt);
			// Reply section
			let response = await handler(request);
			response?.headers?.forEach((v, k) => {
				responder.setHeader(k, v);
			});
			responder.statusCode = response?.status || 200;
			if (response?.statusText) {
				responder.statusMessage = response.statusText;
			};
			responder.flushHeaders();
			let repBodyStream = response.body.getReader(),
			repBodyFlowing = true;
			while (repBodyFlowing) {
				await repBodyStream.read().then(({done, value}) => {
					if (done) {
						responder.end();
						repBodyFlowing = false;
					} else {
						responder.write(value);
					};
				});
			};
		});
		server.listen(port, hostname, () => {
			(opt.onListen || function ({port, hostname}) {
				console.error(`Serving at http://${hostname}:${port}`);
			})({port, hostname});
		});
		return server;
	},
	setEnv: (key, value) => {
		process.env[key] = value;
	},
	sleep: function (ms, maxAdd = 0) {
		return new Promise((y, n) => {
			/*let as = AbortSignal.timeout(ms + Math.floor(maxAdd * Math.random()));
			as.addEventListener("abort", () => {
				y();
			});*/
			setTimeout(y, ms + Math.floor(maxAdd * Math.random()));
		});
	},
	writeFile: async function (path, data, opt = {}) {
		// Deno.writeFile
		let newOpt = {
			flag: "w"
		};
		if (opt.append) {
			newOpt.flag = "a";
		};
		if (opt.signal) {
			newOpt.signal = opt.signal;
		};
		if (opt.mode) {
			newOpt.mode = opt.mode;
		};
		await fs.promises.writeFile(path, data, newOpt);
	}
};

export {
	WingBlade
};
