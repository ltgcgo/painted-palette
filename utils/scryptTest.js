import {scrypt} from "../libs/scrypt/scrypt.js";
import {Base64} from "../libs/js-base64/base64.js";

let utf8Enc = new TextEncoder();
let globalSalt = Base64.toUint8Array("iEUGI-iCw0geuADPcHQImZe2qpGQlSJl");

let deriveHash = function (string) {
	return Base64.fromUint8Array(scrypt.syncScrypt(
		utf8Enc.encode(string.normalize("NFKC")),
		globalSalt,
		8192, 8, 1, 24
	), true);
};

for (let r = 0; r < 16; r ++) {
	console.info(deriveHash("Hi Luna!"));
};