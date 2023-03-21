// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0.

"use strict";

let WingBlade = {
	variant: "Deno",
	getEnv: (key, fallbackValue) => {
		return Deno.env.get(key) || fallbackValue;
	},
	args: Deno.args
};

export {
	WingBlade
};
