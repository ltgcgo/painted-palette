// Copyright (c) Lightingale Flame Author(s) 2023.
// Licensed under GNU AGPL 3.0.

"use strict";

let WingBlade = {
	args: process.argv.slice(2),
	variant: "Node",
	getEnv: (key, fallbackValue) => {
		return process.env[key] || fallbackValue;
	},
	sleep: function (ms) {
		return new Promise((y, n) => {
			/*let as = AbortSignal.timeout(ms);
			as.addEventListener("abort", () => {
				y();
			});*/
			setTimeout(y, ms);
		});
	}
};

export {
	WingBlade
};
