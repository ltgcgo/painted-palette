"use strict";

import KdTreeSrc from "../../libs/kd-tree/kd-tree.js";
let {kdTree, BinaryHeap} = KdTreeSrc;
import {dim3Dist} from "./common.js";

const colourspace = [0, 1, 2];

let ColourPaletteSpace = class {
	tree;
	gate = 110.851252; // Maximum allowed difference
	add(point) {
		return this.tree.insert(point);
	};
	del(point) {
		return this.tree.remnove(point);
	};
	get balanceFactor() {
		return this.tree.balanceFactor();
	};
	restart(...points) {
		delete this.tree;
		this.tree = new kdTree(points, dim3Dist, colourspace);
	};
	nearest(colour) {
		let result = this.tree.nearest(colour, 1)[0];
		if (result[1] > this.gate) {
			console.info(`[Colour]    Target colour exceeded colour similarity gate.`);
			return;
		};
		return result[0];
	};
	constructor() {
		this.restart();
	};
};

export {
	ColourPaletteSpace
};
