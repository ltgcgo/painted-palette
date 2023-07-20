// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

// Raw Connections
let RawClient = class extends EventTarget {
	// onopen, ondata, onclose, onerror
	#proto;
	#host;
	#port;
	#controller;
	#source;
	#sink;
	#reader; // DefaultReader
	#writer; // DefaultWriter
	#queue = []; // Data queue
	#pool = []; // Stream queue
	#readyState = 3;
	#freed = false;
	CONNECTING = 0;
	OPEN = 1;
	CLOSING = 2;
	CLOSED = 3;
	get protocol() {
		return this.#proto;
	};
	get hostname() {
		return this.#host;
	};
	get port() {
		return this.#port;
	};
	get readyState() {
		return this.#readyState;
	};
	get source() {
		return this.#reader;
	};
	get sink() {
		return this.#writer;
	};
	addEventListener(type, handler, opt) {
		if (type == "open") {
			if (this.readyState == this.OPEN) {
				handler.call(this, new Event("open"));
			};
		};
		super.addEventListener(type, handler, opt);
	};
	send(data) {
		// Send data when connected
		// Enqueued data otherwise
		if (this.#freed) {
			throw(new Error(`Cannot enqueue or send data on a freed connection`));
		};
		if (this.#readyState != this.OPEN) {
			// Enqueue data in data queue
			this.#queue.push(data);
		} else if (this.#writer?.desiredSize < 0 || this.#pool.length) {
			// Enqueue data in stream queue
			this.#pool.push(data);
			this.#writer.ready.then(() => {
				let data = this.#pool.shift();
				if (data) {
					this.#writer.write(data);
				};
			});
		} else {
			// Send data
			this.#writer.write(data);
		};
	};
	async connect() {
		// Start or restarts the connection
		if (this.#freed) {
			throw(new Error(`Cannot restart a freed connection`));
		};
		if (this.#readyState < this.CLOSING) {
			console.debug(`${this.#proto.toUpperCase()} connection is already open.`);
			return;
		};
		// Set readyState to CONNECTING
		this.#readyState = this.CONNECTING;
		// Open the connection
		switch (this.#proto) {
			case "tcp": {
				let conn = await Deno.connect({hostname: this.#host, port: this.#port});
				this.#controller = conn;
				this.#source = conn.readable;
				this.#reader = conn.readable.getReader();
				this.#sink = conn.writable;
				this.#writer = conn.writable.getWriter();
				break;
			};
			default: {
				this.free();
				throw(new Error(`Invalid protocol "${this.#proto}"`));
			};
		};
		// Set readyState to OPEN
		this.#readyState = this.OPEN;
		this.dispatchEvent(new Event("open"));
		// Read from stream
		(async () => {
			try {
				let alive = true;
				while (alive) {
					let {value, done} = await this.#reader.read();
					alive = !done;
					if (value) {
						this.dispatchEvent(new MessageEvent("data", {data: value}));
					};
					if (done) {
						this.close();
					};
				};
			} catch (err) {
				this.dispatchEvent(new ErrorEvent("error", {
					message: err.message,
					error: err
				}));
				this.close();
			};
		})()
	};
	close() {
		if (this.#readyState > this.OPEN) {
			console.debug(`${this.#proto.toUpperCase()} connection is already closed.`);
			return;
		};
		// Set readyState to CLOSING
		this.#readyState = this.CLOSING;
		// Close the connection
		switch (this.#proto) {
			case "tcp": {
				let {rid} = this.#controller;
				if (Deno.resources()[rid]) {
					this.#controller?.close();
				};
				break;
			};
			default: {
				throw(new Error(`Invalid protocol "${this.#proto}"`));
			};
		};
		// Set readyState to CLOSED
		this.#readyState = this.CLOSED;
		this.dispatchEvent(new Event("close"));
	};
	free() {
		// Close and forbid any further connection attempts
		this.close();
		this.#freed = true;
		// Returns any data not sent
		return this.#queue.splice(0, this.#queue.length);
	};
	constructor({proto, host, port}, immediate) {
		super();
		// Default values
		proto = proto || "tcp";
		host = host || "127.0.0.1";
		port = port || 80;
		// Set object properties
		this.#proto = proto;
		this.#host = host;
		this.#port = port;
		// Send data upon connection
		this.addEventListener("open", async () => {
			this.#queue.forEach((e) => {
				this.send(e);
			});
		});
		// Move data back to queue if closed
		this.addEventListener("close", () => {
			if (this.#pool.length) {
				this.#queue.splice(0, 0, this.#pool.splice(0, this.#pool.length));
			};
		});
		// Connect immediately if set
		if (immediate) {
			this.connect();
		};
	};
};
let RawServerSocket = class extends EventTarget {
	// onopen, ondata, onclose, onerror
	#clientAddr;
	#controller;
	#source;
	#sink;
	#reader; // DefaultReader
	#writer; // DefaultWriter
	#readyState = 1;
	OPEN = 1;
	CLOSING = 2;
	CLOSED = 3;
	get ip() {
		return this.#clientAddr.hostname || "0.0.0.0";
	};
	get port() {
		return this.#clientAddr.port || 0;
	};
	get readyState() {
		return this.#readyState;
	};
	get source() {
		return this.#reader;
	};
	get sink() {
		return this.#writer;
	};
	send(data) {
		// Send data when connected
		// Enqueued data otherwise
		if (this.#readyState == 1) {
			// Send data
			this.#writer.write(data);
		};
	};
	close() {
		this.#readyState = this.CLOSING;
		this.#controller.close();
		this.#readyState = this.CLOSED;
		this.dispatchEvent(new Event("close"));
	};
	addEventListener(type, handler, opt) {
		if (type == "open") {
			if (this.readyState == this.OPEN) {
				handler.call(this, new Event("open"));
			};
		};
		super.addEventListener(type, handler, opt);
	};
	constructor(denoConn) {
		super();
		this.#clientAddr = denoConn.remoteAddr;
		this.#controller = denoConn;
		this.#source = denoConn.readable;
		this.#reader = denoConn.readable.getReader();
		this.#sink = denoConn.writable;
		this.#writer = denoConn.writable.getWriter();
		(async () => {
			let alive = true;
			while (alive) {
				let {value, done} = await this.#reader.read();
				alive = !done;
				if (value) {
					this.dispatchEvent(new MessageEvent("data", {data: value}));
				};
				if (done) {
					this.close();
				};
			};
		})();
	};
};
let RawServer = class extends EventTarget {
	// onlisten, onaccept, onclose, onerror
	#proto;
	#host;
	#port;
	#reuse;
	#controller;
	#active = false;
	#freed = false;
	get active() {
		return this.#active;
	};
	get proto() {
		return this.#proto;
	};
	get host() {
		return this.#host;
	};
	get port() {
		return this.#port;
	};
	get reuse() {
		return this.#reuse;
	};
	async listen() {
		if (this.#freed) {
			throw(new Error(`Cannot restart a freed connection`));
		};
		if (this.#active) {
			console.debug(`${this.#proto.toUpperCase()} server on ${this.#host}:${this.#port} is already active.`);
			return;
		};
		let upThis = this;
		try {
			switch (this.#proto) {
				case "tcp": {
					upThis.#controller = Deno.listen({
						hostname: upThis.#host,
						port: upThis.#port,
						reusePort: upThis.#reuse
					});
					upThis.dispatchEvent(new Event("listen"));
					for await (const conn of upThis.#controller.accept()) {
						upThis.dispatchEvent(new MessageEvent("accept"), {data: new RawServerSocket(conn)});
					};
					break;
				};
				default: {
					upThis.free();
					throw(new Error(`Invalid protocol "${upThis.#proto}"`));
				};
			};
		} catch (err) {
			this.dispatchEvent(new Event("close"));
		};
	};
	close() {
		if (!this.#active) {
			console.debug(`${this.#proto.toUpperCase()} server on ${this.#host}:${this.#port} is already closed.`);
			return;
		};
		switch (this.#proto) {
			case "tcp": {
				this.#controller?.close();
				break;
			};
		};
	};
	free() {
		// Close and forbid any further connection attempts
		this.close();
		this.#freed = true;
	};
	constructor({proto, host, port, reuse}, immediate) {
		super();
		// Default values
		proto = proto || "tcp";
		host = host || "0.0.0.0";
		port = port || 8000;
		// Set object properties
		this.#proto = proto;
		this.#host = host;
		this.#port = port;
		this.#reuse = reuse;
		// Show message on listen
		this.addEventListener("listen", () => {
			console.error(`WingBlade ${proto.toUpperCase()} server listening on ${host}:${port}`);
		});
		// Listen if immediate
		if (immediate) {
			this.listen();
		};
	};
};

// Network interfaces
let net = class {
	static RawClient = RawClient;
	static RawServer = RawServer;
};

export default net;
