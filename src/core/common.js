"use strict";

const dim3Prop = Array.from("rgb");

let BuildInfo = {
	name: "Painted Palette",
	ver: "0.0.3"
};

let dim3Dist = function (a, b) {
	let sum = 0;
	dim3Prop.forEach((e) => {
		sum += (a[e] - b[e]) ** 2;
	});
	return Math.sqrt(sum);
};

export {
	BuildInfo,
	dim3Dist
};
