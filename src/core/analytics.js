"use strict";

import {FetchContext} from "./fetchContext.js";
import {uuid} from "../../libs/uuid/uuid.js";

let Analytics = class {
	#fc = new FetchContext("https://equestria.dev");
	uuid = uuid.v4();
	#url;
	async botPlacement({userHash, x, y, color, reddit, safe, fail = false}) {
		// UID must be a hash already derived with Scrypt
		await this.#fc.fetch(this.#url, {
			"method": "POST",
			"body": JSON.stringify({
				"event": fail ? "pixelfail" : "pixel",
				"type": "autofocus",
				"template": "mlp",
				"source": "painted-palette",
				"id": this.uuid,
				"timestamp": Date.now() / 1000,
				userHash,
				"pos": {x, y},
				color,
				"nextPixelPlace": fail ? reddit : {reddit, safe},
				"environment": "maneplace"
			})
		});
	};
	async sendError(userHash, message) {
		await this.#fc.fetch(this.#url, {
			"method": "POST",
			"body": JSON.stringify({
				"event": "error",
				"type": "autofocus",
				"source": "painted-palette",
				"id": this.uuid,
				"timestamp": Date.now() / 1000,
				userHash,
				message
			})
		});
	};
	async accountFail(userHash, nextPixelPlace) {
		await this.#fc.fetch(this.#url, {
			"method": "POST",
			"body": JSON.stringify({
				"event": "accfail",
				"type": "autofocus",
				"source": "painted-palette",
				"id": this.uuid,
				"timestamp": Date.now() / 1000,
				userHash,
				nextPixelPlace
			})
		});
	};
	constructor(url) {
		this.#url = url;
		console.info(`[Analytics] Created analytics as ${this.uuid}.`);
	};
};

export {
	Analytics
};
