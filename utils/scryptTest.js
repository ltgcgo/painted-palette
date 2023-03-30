import {scrypt} from "../libs/scrypt/scrypt.js";
import {Base64} from "../libs/js-base64/base64.js";

let utf8Enc = new TextEncoder();

//let globalSalt = utf8Enc.encode("I Love Princess Luna!".normalize("NFKC"));
let globalSalt = Base64.toUint8Array("iEUGI-iCw0geuADPcHQImZe2qpGQlSJl");
console.info(`Salt: ${globalSalt}`);

let derivePassword = function (string) {
	return scrypt.syncScrypt(
		utf8Enc.encode(string.normalize("NFKC")),
		globalSalt,
		4096, 8, 1, 24
	);
};

let derived = derivePassword("Hi Luna!");
//console.info(derived);
console.info(Base64.fromUint8Array(derived, true));
//console.info(Base64.toUint8Array(Base64.fromUint8Array(derived, true)));