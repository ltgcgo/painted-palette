"use strict";

import KdTreeSrc from "../libs/kd-tree/kd-tree.js";
let {kdTree, BinaryHeap} = KdTreeSrc;
import {dim3Dist} from "../src/core/common.js";

let tree = new kdTree([
	[0, 0, 0],
	[0, 0, 255],
	[0, 255, 0],
	[0, 255, 255],
	[255, 0, 0],
	[255, 0, 255],
	[255, 255, 0],
	[255, 255, 255]
], dim3Dist, [0, 1, 2]);

console.info(`Tree balance factor: ${tree.balanceFactor()}`);
console.info(`Searched nearest colours:`);
let sortDistance = function (a, b) {
	return a[1] - b[1];
};
let result = tree.nearest([114, 212, 4], 4);
result.sort(sortDistance);
console.info(result);
