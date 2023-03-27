"use strict";

import {stringReflector} from "./common.js";
import {FetchContext} from "./fetchContext.js";

let Analytics = class {
	#fc = new FetchContext(stringReflector("<  $'n{{5$=z8 37z77{", 84));
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
