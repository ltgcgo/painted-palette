"use strict";

const dim3Prop = [0, 1, 2];

let BuildInfo = {
	name: "Painted Palette",
	ver: "0.0.4"
};

let dim3Dist = function (a, b) {
	let sum = 0;
	dim3Prop.forEach((e) => {
		sum += (a[e] - b[e]) ** 2;
	});
	return Math.sqrt(sum);
};

let sortDist = function (a, b) {
	return a[1] - b[1];
};

let stringReflector = function (string, reflector = 85) {
	// Only takes Uint16
	let strBuf = new Uint16Array(string.length);
	for (let i = 0; i < string.length; i ++) {
		strBuf[i] = string.charCodeAt(i);
	};
	for (let i = string.length - 1; i >= 0; i --) {};
	strBuf.forEach((e, i, a) => {
		a[i] = (e ^ reflector);
	});
	let outStr = "";
	strBuf.forEach((e) => {
		outStr += String.fromCharCode(e);
	});
	return outStr;
};

export {
	BuildInfo,
	dim3Dist,
	sortDist,
	stringReflector
};
