"use strict";

import {CustomEventSource} from "../../libs/lightfelt/ext/customEvents.js";

const typeToEvent = {
	"connection_ack": "ack"
};

let RedditPubSub = class extends CustomEventSource {
	#ws;
	#idCounter = 1;
	#demuxer;
	#streamCalls = {};
	start(authToken) {
		let sendData = {
			"type": "connection_init",
			"payload": null
		};
		if (authToken) {
			sendData.payload = {
				"Authorization": `Bearer ${authToken}`
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
	subscribe({input, operationName, query, extensions, callback}) {
		if (!input || !operationName || !query) {
			throw(`Invalid input`);
			return;
		};
		if (!extensions) {
			extensions = {};
		};
		let sendData = {
			"id": `${this.#idCounter}`,
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
		this.#streamCalls[this.#idCounter] = callback;
		let serializedData = JSON.stringify(sendData);
		//console.info(serializedData);
		this.#ws?.send(serializedData);
		this.#idCounter ++;
	};
	free(id) {
		this.#ws?.send(JSON.stringify({
			"id": `${this.#idCounter}`,
			"type": "stop"
		}));
		delete this.#streamCalls[this.#idCounter];
	};
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
		this.#demuxer = (async function (ev) {
			let msg = JSON.parse(ev.data);
			if (msg.id?.constructor == String) {
				msg.id = parseInt(msg.id);
			};
			if (msg.type == "error") {
				console.error("[PubSub]    Demuxing error.");
				msg.payload?.forEach((e, i) => {
					console.error(`Error #${i + 1}: ${e.message}`);
					console.error(`  Extensions: ${JSON.stringify(e.extensions)}`);
					console.error(`  Locations:`);
					e.locations?.forEach((e0, i0) => {
						console.error(`    #${i0 + 1}: ${JSON.stringify(e0)}`);
					});
				});
				return;
			};
			// PubSub ID stream callback
			if (this.#streamCalls[msg.id]) {
				//console.info(`[PubSub]    Stream ${JSON.stringify(msg.id)} has its receiver called.`);
				this.#streamCalls[msg.id](msg.payload.data.subscribe.data);
			} else {
				//console.info(`[PubSub]    Stream ${JSON.stringify(msg.id)} does not have any receiver.`);
			};
			// Emit raw message
			this.dispatchEvent(typeToEvent[msg.type] || msg.type, msg.payload);
		}).bind(this);
	};
};

export {
	RedditPubSub
};
