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

export {
	BuildInfo,
	dim3Dist,
	sortDist
};
