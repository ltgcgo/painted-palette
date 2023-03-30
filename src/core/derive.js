"use strict";

import {scrypt} from "../../libs/scrypt/scrypt.js";
import {Base64} from "../../libs/js-base64/base64.js";

let utf8Enc = new TextEncoder(),
globalSalt = Base64.toUint8Array("PjOUZfxoW7_-hh-u90bX4fhDP0ADzO11");

let deriveHash = function (string) {
	return Base64.fromUint8Array(
		scrypt.syncScrypt(
			utf8Enc.encode(string.normalize("NFKC")),
			globalSalt, 8192, 8, 1, 24
		), true
	);
};

export {
	deriveHash
};
