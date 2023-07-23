"use strict";

const dim3Prop = [0, 1, 2];
const dim2Prop = [0, 1];

let BuildInfo = {
	name: "Painted Palette",
	ver: "0.1.6"
};

let dim3Dist = function (a, b) {
	let sum = 0;
	dim3Prop.forEach((e) => {
		sum += (a[e] - b[e]) ** 2;
	});
	return Math.sqrt(sum);
};
let dim2Dist = function (a, b) {
	let sum = 0;
	dim2Prop.forEach((e) => {
		sum += (a[e] - b[e]) ** 2;
	});
	return Math.sqrt(sum);
};

let sortDist = function (a, b) {
	return a[1] - b[1];
};

let humanizedTime = function (inSeconds = 0) {
	let ms = `${Math.floor(inSeconds % 1 * 100)}`.padStart(2, "0");
	let sec = `${Math.floor(inSeconds % 60)}`.padStart(2, "0");
	let min = `${Math.floor(inSeconds / 60) % 60}`.padStart(2, "0");
	let hr = `${Math.floor(inSeconds / 3600) % 24}`.padStart(2, "0");
	let day = `${Math.floor(inSeconds / 86400)}`;
	return `${day}d ${hr}:${min}:${sec}.${ms}`;
};
let humanizedPercentage = function (floatv = 0) {
	floatv = Math.round(floatv * 10000) / 100;
	let intv = `${Math.floor(floatv)}`;
	let fracv = `${Math.floor(floatv * 100 % 100)}`.padStart(2, "0");
	return `${intv}.${fracv}%`;
};
let humanizedSize = function (bytes) {
	let scale = Math.floor(Math.log2(bytes) / 10) || 0;
	return `${Math.round((bytes / (1024 ** scale)) * 1000) / 1000} ${['B','KiB','MiB','GiB','TiB'][scale]}`;
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
	dim2Dist,
	sortDist,
	humanizedTime,
	humanizedPercentage,
	humanizedSize,
	stringReflector
};
