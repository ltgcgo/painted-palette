// The Node interface

"use strict";

if (!globalThis.self) {
	globalThis.self = globalThis;
};

import {WingBlade} from "./wingblade.js";
self.WingBlade = WingBlade;

import {main} from "../core/index.js";
main(WingBlade.args);
