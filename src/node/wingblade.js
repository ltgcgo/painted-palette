// Copyright (c) Lightingale Flame Author(s) 2023.
// Licensed under GNU AGPL 3.0.

"use strict";

let WingBlade = {
	variant: "Node",
	getEnv: (key, fallbackValue) => {
		return process.env[key] || fallbackValue;
	},
	args: process.argv.slice(2)
};

export {
	WingBlade
};
