// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import pageError from "../shared/error.htm";

// WebSocketServer polyfill
let WebSocketServer = class extends EventTarget {
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
	addEventListener(type, handler, opt) {
		if (type == "open") {
			if (this.readyState < 2) {
				handler.call(this, new Event("open"));
			};
		};
		super.addEventListener(type, handler, opt);
	};
	get binaryType() {
		return this.#attached?.binaryType || "";
	};
	get bufferedAmount() {
		return this.#attached?.bufferedAmount || 0;
	};
	get extensions() {
		return this.#attached?.extensions || "";
	};
	get readyState() {
		return this.#attached?.readyState || 0;
	};
	get url() {
		return this.#attached?.url || this.#url;
	};
	attach(wsService) {
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
				upThis.dispatchEvent(new Event("open"));
				break;
			};
			case 2:
			case 3: {
				upThis.dispatchEvent(new Event("close"));
				break;
			};
		};
	};
	close(...args) {
		this.#closed = true;
		return this.#attached?.close(...args);
	};
	send(data) {
		if (this.#attached) {
			return this.#attached.send(data);
		} else {
			this.#dataQueue.push(data);
			return data.length || data.size || data.byteLength || 0;
		};
	};
	constructor(request) {
		super();
		this.#url = request.url.replace("http", "ws");
		this.addEventListener("open", (ev) => {
			// Send everything in the queue
			while (this.#dataQueue.length > 0) {
				this.#attached.send(this.#dataQueue.shift());
			};
		});
	};
};

// Web interfaces
let web = class {
	static serve(handler, opt = {}) {
		// Deno std/http/server.ts:serve()
		let cwdPath = `${process.cwd()}`;
		let port = opt.port || 8000;
		let hostname = opt.hostname || "0.0.0.0";
		let server = Bun.serve({
			port,
			hostname,
			fetch: async (request, server) => {
				// Reply section
				request.socket = server;
				try {
					let response = await handler(request);
					if (response?.constructor != Response) {
						response = new Response(JSON.stringify(response), {
							headers: {
								"Content-Type": "text/plain"
							}
						});
					};
					return response;
				} catch (err) {
					let errStack = err.stack.split("\n");
					errStack.forEach((e, i, a) => {
						a[i] = e.replace("@", " at ").replace("[native code]", "bun:internal");
					});
					errStack.unshift(`${err.name || "Error"}${err.message ? ":" : ""} ${err.message || ""}`);
					errStack = errStack.join("\n    ");
					console.error(`Request error at ${request.method} ${request.url}\n${errStack}`);
					return new Response(pageError.replace("${runtime}", WingBlade.rt.variant).replace("${stackTrace}", errStack.replaceAll(cwdPath, "wingblade:app")), {
						status: 502,
						headers: {
							"Content-Type": "text/html"
						}
					});
				};
			},
			websocket: {
				open(ws) {
					let wsServer = ws.data.wsServer;
					wsServer.attach(ws);
					wsServer.dispatchEvent(new Event("open"));
				},
				message(ws, msg) {
					ws.data.wsServer.dispatchEvent(new MessageEvent("message", {data: msg}));
				},
				close(ws, code, msg) {
					ws.data.wsServer.dispatchEvent(new Event("close"));
				}
			}
		});
		console.error(`WingBlade serving at http://${hostname == "0.0.0.0" ? "127.0.0.1" : hostname}:${port}`);
		return server;
	};
	static acceptWs(req, opt) {
		// Deno.upgradeWebSocket
		let wsServer = new WebSocketServer(req);
		req.socket.upgrade(req, {
			data: {
				wsServer
			}
		});
		return {
			socket: wsServer,
			response: new Response(null, {
				status: 200
			})
		};
	};
};

export default web;
