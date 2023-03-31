// Copyright (c) Lightingale Flame Author(s) 2023.
// Licensed under GNU AGPL 3.0.

"use strict";

let WebSocketServer = class {
	#attached;
	#url;
	#closed = false;
	#dataQueue = [];
	#events = {
		open: [],
		message: [],
		error: [],
		close: []
	};
	addEventListener(type, handler) {
		if (this.#attached) {
			if (type != "open") {
				this.#attached.addEventListener(type, handler);
			} else {
				handler(new Event("open"));
			};
		} else {
			this.#events[type].push(handler);
		};
	};
	get binaryType () {
		return this.#attached?.binaryType || "";
	};
	get bufferedAmount () {
		return this.#attached?.bufferedAmount || 0;
	};
	get extensions () {
		return this.#attached?.extensions || "";
	};
	get readyState () {
		return this.#attached?.readyState || 0;
	};
	get url () {
		return this.#attached?.url || this.#url;
	};
	attach (wsService) {
		if (this.#closed) {
			return false;
		};
		if (this.#attached) {
			throw(new Error("Already attached a WebSocket object"));
			return false;
		};
		this.#attached = wsService;
		let upThis = this;
		switch (wsService.readyState) {
			case 0:
			case 1: {
				for (let type in this.#events) {
					this.#events[type].forEach((e) => {
						wsService.addEventListener(type, e);
					});
				};
				let openEvent = new Event("open");
				this.#events.open.forEach((e) => {
					e(openEvent);
				});
				break;
			};
			case 2:
			case 3: {
				upThis.dispatchEvent(new Event("close"));
				break;
			};
		};
	};
	close (...args) {
		this.#closed = true;
		return this.#attached?.close(...args);
	};
	send (data) {
		if (this.#attached) {
			this.#attached.send(data);
		} else {
			this.#dataQueue.push(data);
		};
	};
	constructor (request) {
		this.#url = request.url.replace("http", "ws");
		this.addEventListener("open", (ev) => {
			// Send everything in the queue
			while (this.#dataQueue.length > 0) {
				this.#attached.send(this.#dataQueue.shift());
			};
		});
	};
};

let WingBlade = {
	args: process.argv.slice(2),
	os: os.platform(),
	variant: "Node",
	version: process.version.replace("v", ""),
	exit: (code = 0) => {
		process.exit(code);
	},
	getEnv: (key, fallbackValue) => {
		return process.env[key] || fallbackValue;
	},
	memUsed: () => {
		return process.memoryUsage();
	},
	randomInt: (cap) => {
		return Math.floor(Math.random() * cap);
	},
	readFile: async function (path, opt) {
		return new Uint8Array((await fs.promises.readFile(path, opt)).buffer);
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
		server.on("upgrade", async (requester, socket, head) => {
			let reqOpt = {
				"method": requester.method,
				"headers": requester.headers
			};
			let request = new Request(`${requester.headers["x-forwarded-proto"] || "http"}://${requester.headers.host}${requester.url}`, reqOpt);
			request.raw = {
				requester,
				socket,
				head
			};
			await handler(request);
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
	upgradeWebSocket: (req) => {
		let wsUpgrader = new WebSocketService({noServer: true});
		let wsServer = new WebSocketServer(req);
		wsUpgrader.handleUpgrade(req.raw.requester, req.raw.socket, req.raw.head, function (ws) {
			wsServer.attach(ws);
		});
		return {
			socket: wsServer,
			response: new Response(null, {
				status: 200
			})
		};
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
