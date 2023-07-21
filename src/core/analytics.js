"use strict";

import {FetchContext} from "./fetchContext.js";
import {uuid} from "../../libs/uuid/uuid.js";

let Analytics = class {
	#fc = new FetchContext("https://equestria.dev");
	uuid = uuid.v4();
	#url;
	async botPlacement({userHash, x, y, color, reddit, safe, fail = false}) {
		// UID must be a hash already derived with Scrypt
		let serialized = JSON.stringify({
			"event": fail ? "pixelfail" : "pixel",
			"type": "autofocus",
			"template": "mlp",
			"source": "painted-palette",
			"id": this.uuid,
			"timestamp": Date.now() / 1000,
			//userHash,
			"pos": {x, y},
			color,
			"nextPixelPlace": reddit,
			"environment": "reddit"
		});
		await this.#fc.fetch(this.#url, {
			"method": "POST",
			"body": serialized,
			"headers": {
				"Content-Type": "application/json"
			}
		});
		console.info(serialized);
		console.info(`[Analytics] Sent successful placement as ${this.uuid}.`);
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
				//userHash,
				message
			}),
			"headers": {
				"Content-Type": "application/json"
			}
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
				//userHash,
				nextPixelPlace
			}),
			"headers": {
				"Content-Type": "application/json"
			}
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
