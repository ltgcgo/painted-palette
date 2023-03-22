// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0.

"use strict";

let WingBlade = {
	args: Deno.args,
	os: Deno.build.os,
	variant: "Deno",
	exit: (code = 0) => {
		Deno.exit(code);
	},
	getEnv: (key, fallbackValue) => {
		return Deno.env.get(key) || fallbackValue;
	},
	setEnv: (key, value) => {
		return Deno.env.set(key, value);
	},
	sleep: function (ms, maxAdd = 0) {
		return new Promise((y, n) => {
			let as = AbortSignal.timeout(ms + Math.floor(maxAdd * Math.random()));
			as.addEventListener("abort", () => {
				y();
			});
		});
	},
	writeFile: async function (path, data, opt) {
		await Deno.writeFile(path, data, opt);
	}
};

export {
	WingBlade
};
