// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

// Raw Connections
let RawClient = class extends EventTarget {
	// onopen, ondata, onclose, onerror
	#proto;
	#host;
	#port;
	#source;
	#sink;
	#controller;
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
		if (this.#readyState != 1) {
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
		};
		// Set readyState to CONNECTING
		this.#readyState = this.CONNECTING;
		// Open the connection
		switch (this.#proto) {
			case "tcp": {
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
	};
	close() {
		if (this.#readyState > this.OPEN) {
			console.debug(`${this.#proto.toUpperCase()} connection is already closed.`);
		};
		// Set readyState to CLOSING
		this.#readyState = this.CLOSING;
		// Close the connection
		switch (this.#proto) {
			case "tcp": {
				break;
			};
			default: {
				this.free();
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
	constructor({proto, host, port}, immediateConnect) {
		super();
		// Default values
		proto = proto || "tcp";
		host = host || "127.0.0.1";
		port = port || 80;
		// Set the object properties
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
		if (immediateConnect) {
			this.connect();
		};
	};
};

// Network interfaces
let net = class {
	static RawClient = RawClient;
};

export default net;
