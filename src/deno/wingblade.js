// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0.

"use strict";

let WingBlade = {
	args: Deno.args,
	variant: "Deno",
	getEnv: (key, fallbackValue) => {
		return Deno.env.get(key) || fallbackValue;
	},
	sleep: function (ms) {
		return new Promise((y, n) => {
			let as = AbortSignal.timeout(ms);
			as.addEventListener("abort", () => {
				y();
			});
		});
	}
};

export {
	WingBlade
};
