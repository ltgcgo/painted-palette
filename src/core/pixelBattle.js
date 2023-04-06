"use strict";

import {CustomEventSource} from "../../libs/lightfelt/ext/customEvents.js";
import {dim2Dist, sortDist} from "./common.js";
import KdTreeSrc from "../../libs/kd-tree/kd-tree.js";
let {kdTree, BinaryHeap} = KdTreeSrc;
import {ColourPaletteSpace} from "./colour.js";

let generatePalette = function () {
	let arr = [
		[255, 255, 255],
		[194, 194, 194],
		[133, 133, 133],
		[71, 71, 71],
		[0, 0, 0],
		[58, 175, 255],
		[113, 170, 235],
		[74, 118, 168],
		[7, 75, 243],
		[94, 48, 235],
		[255, 108, 91],
		[254, 37, 0],
		[255, 33, 139],
		[153, 36, 79],
		[77, 44, 156],
		[255, 207, 74],
		[254, 180, 63],
		[254, 134, 72],
		[255, 91, 54],
		[218, 81, 0],
		[148, 224, 68],
		[92, 191, 13],
		[195, 209, 23],
		[252, 199, 0],
		[211, 131, 1]
	];
	arr.forEach((e, i, a) => {
		a[i] = new Uint8Array([...e, i]);
	});
	return arr;
};

/*
Decode full canvas frame: map 0~9 and a~o to palette colour indexes. 0 to 0, and o to 24.

Decode live canvas feed: uint32Data = (flag * 25 + colourId) * 636000 + y * 1590 + x

Place a pixel: flag as 0, other params same as above

This pony is free for you to ride.
*/

let PixelBattle = class extends CustomEventSource {
	#context;
	#x = 0;
	#y = 0;
	#isPlacing = false;
	ws; // Managed WebSocket
	cc; // Managed CanvasConfiguration
	pg; // Paint Guide
	pp; // Point Partition
	va; // Attached VKontakte authenticator
	lastColour = "transparent";
	disableStream = false;
	loggedIn = false;
	wsActive = false;
	nextAt = 0;
	safeAt = 0;
	setCc() {
		if (!this.cc) {
			this.cc = {};
		};
		cc = this.cc;
		cc.colours = new ColourPaletteSpace(generatePalette);
		cc.width = 1590;
		cc.height = 400;
		cc.uWidth = 1590;
		cc.uHeight = 400;
		cc.data = cc.data || new kdTree([], dim2Dist, [0, 1]); // Monitored canvas as point clouds
	};
	getFocus() {};
	async partitionPixels() {};
	async rebuildDamageCloud() {};
	async focusPixel() {};
	async placePixel({x = this.#x, y = this.#y, ci = 0}) {};
	async place() {};
	async startStream() {};
	async stopStream() {};
	constructor(browserContext) {
		super();
		this.#context = browserContext;
	};
};

export {
	PixelBattle
};
