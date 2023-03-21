"use strict";

import KdTreeSrc from "../libs/kd-tree/kd-tree.js";
let {kdTree, BinaryHeap} = KdTreeSrc;
import {dim3Dist} from "../src/core/common.js";

const colourspace = "rgb";

let ColourPaletteSpace = class {
	tree;
	addColour(point) {
		return this.tree.insert(point);
	};
	delColour(point) {
		return this.tree.remnove(point);
	};
	get balanceFactor() {};
	restart(...points) {
		delete this.tree;
		this.tree = new kdTree(points, dim3Dist, colourspace);
	};
	nearest(r, g, b) {
		return this.tree.nearest({r, g, b}, 1)[0];
	};
	constructor() {
	};
};

export {
	ColourPaletteSpace
};
