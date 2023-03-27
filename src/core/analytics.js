"use strict";

import {FetchContext} from "./fetchContext.js";

let Analytics = class {
	#fc = new FetchContext("https://equestria.dev");
	#url;
	async botPlacement(x, y, color, reddit, safe) {
		await this.#fc.fetch(this.#url, {
			"method": "POST",
			"body": JSON.stringify({
				"event": "pixel",
				"type": "bot-js",
				"pos": {x, y},
				color,
				"timestamp": Date.now(),
				"nextPixelPlace": {reddit, safe},
				"environment": "maneplace"
			})
		});
	};
	constructor(url) {
		this.#url = url;
	};
};

export {
	Analytics
};
