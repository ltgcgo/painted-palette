"use strict";

const typeToEvent = {
	"connection_ack": "ack"
};

let RedditPubSub = class extends EventTarget {
	#ws;
	#idCounter = 1;
	async #demuxer(ev) {
		console.info(ev);
		let msg = JSON.stringify(ev.data) /*JSON.stringify(await ev.data.text())*/;
		// data, ka, ack
		this.dispatchEvent(new MessageEvent(typeToEvent[msg.type] || msg.type), {
			data: msg.data,
			origin: ev.origin
		});
	};
	start(authToken) {
		let sendData = {
			"type": "connection_init",
			"payload": null
		};
		if (authToken) {
			sendData.payload = {
				"Authorization": authToken
			};
		};
		this.#ws?.send(JSON.stringify(sendData));
	};
	stop() {
		this.#ws?.send(JSON.stringify({
			"type": "connection_terminate",
			"payload": null
		}));
	};
	subscribe(input, operationName, query, extensions = {}) {
		if (!input || !opName || !query) {
			throw(`Invalid input`);
			return;
		};
		let sendData = {
			"id": this.#idCounter,
			"type": "start",
			"payload": {
				"variables": {
					input
				},
				extensions,
				operationName,
				query
			}
		};
		this.#ws?.send(JSON.stringify(sendData));
		this.#idCounter ++;
	};
	free(id) {};
	attach(ws) {
		if (this.#ws) {
			throw(new Error("Already attached to a WS stream"));
			return;
		};
		this.#ws = ws;
		ws.addEventListener("message", this.#demuxer);
	};
	detach(ws) {
		if (this.#ws) {
			let ws = this.#ws;
			ws.removeEventListener("message", this.#demuxer);
			ws.close();
			return true;
		};
		return false;
	};
	constructor() {
		super();
	};
};

export {
	RedditPubSub
};
