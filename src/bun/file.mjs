// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

// File operations
let file = class {
	static async read(path, opt) {
		// Deno.readFile
		return new Uint8Array(await Bun.file(path).arrayBuffer());
	};
	static async write(path, data, opt) {
		// Deno.writeFile
		await Bun.write(path, data);
	};
};

export default file;
