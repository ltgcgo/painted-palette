// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

// File operations
let file = class {
	static async read(path, opt) {
		return await Deno.readFile(path, opt);
	};
	static async write(path, data, opt) {
		await Deno.writeFile(path, data, opt);
	};
};

export default file;
