"use strict";

import KdTreeSrc from "../libs/kd-tree/kd-tree.js";
let {kdTree, BinaryHeap} = KdTreeSrc;
import {dim3Dist} from "../src/core/common.js";

let tree = new kdTree([{
	r: 0, g: 0, b: 0
}, {
	r: 0, g: 0, b: 255
}, {
	r: 0, g: 255, b: 0
}, {
	r: 0, g: 255, b: 255
}, {
	r: 255, g: 0, b: 0
}, {
	r: 255, g: 0, b: 255
}, {
	r: 255, g: 255, b: 0
}, {
	r: 255, g: 255, b: 255
}], dim3Dist, "rgb");

console.info(`Tree balance factor: ${tree.balanceFactor()}`);
console.info(`Searched nearest colour:`);
console.info(tree.nearest({r: 114, g: 212, b: 4}, 1));
