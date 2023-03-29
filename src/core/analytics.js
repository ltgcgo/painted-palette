"use strict";

import {FetchContext} from "./fetchContext.js";
import {uuid} from "../../libs/uuid/uuid.js";

let Analytics = class {
	#fc = new FetchContext("https://equestria.dev");
	#uuid = uuid.v4();
	#url;
	async botPlacement(x, y, color, reddit, safe) {
		await this.#fc.fetch(this.#url, {
			"method": "POST",
			"body": JSON.stringify({
				"event": "pixel",
				"type": "bot-js",
				"id": this.#uuid,
				"pos": {x, y},
				color,
				"nextPixelPlace": {reddit, safe},
				"environment": "maneplace"
			})
		});
	};
	async sendError(message) {
		await this.#fc.fetch(this.#url, {
			"method": "POST",
			"body": JSON.stringify({
				"event": "error",
				"type": "bot-js",
				"id": this.#uuid,
				message
			})
		});
	};
	constructor(url) {
		this.#url = url;
		console.info(`[Analytics] Created analytics as ${this.#uuid}.`);
	};
};

export {
	Analytics
};
