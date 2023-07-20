// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

// File operations
let file = class {
	static async read(path, opt) {
		// Deno.readFile
		return new Uint8Array((await fs.promises.readFile(path, opt)).buffer);
	};
	static async write(path, data, opt = {}) {
		// Deno.writeFile
		let newOpt = {
			flag: "w"
		};
		if (opt.append) {
			newOpt.flag = "a";
		};
		if (opt.signal) {
			newOpt.signal = opt.signal;
		};
		if (opt.mode) {
			newOpt.mode = opt.mode;
		};
		await fs.promises.writeFile(path, data, newOpt);
	};
};

export default file;
