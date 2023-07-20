// The Bun interface

"use strict";

import {WingBlade} from "./wingblade.js";
self.WingBlade = WingBlade;

import {main} from "../core/index.js";
main(WingBlade.args);
