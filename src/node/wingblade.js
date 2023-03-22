// Copyright (c) Lightingale Flame Author(s) 2023.
// Licensed under GNU AGPL 3.0.

"use strict";

let WingBlade = {
	args: process.argv.slice(2),
	variant: "Node",
	exit: (code = 0) => {
		process.exit(code);
	},
	getEnv: (key, fallbackValue) => {
		return process.env[key] || fallbackValue;
	},
	setEnv: (key, value) => {
		process.env[key] = value;
	},
	sleep: function (ms, maxAdd = 0) {
		return new Promise((y, n) => {
			/*let as = AbortSignal.timeout(ms + Math.floor(maxAdd * Math.random()));
			as.addEventListener("abort", () => {
				y();
			});*/
			setTimeout(y, ms + Math.floor(maxAdd * Math.random()));
		});
	}
};

export {
	WingBlade
};
