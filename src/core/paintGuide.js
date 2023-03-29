"use strict";

import {dim2Dist} from "./common.js";
import {FetchContext} from "./fetchContext.js";
import {CustomEventSource} from "../../libs/lightfelt/ext/customEvents.js";
import {UPNG} from "../../libs/upng/upng.min.js";

import KdTreeSrc from "../../libs/kd-tree/kd-tree.js";
let {kdTree, BinaryHeap} = KdTreeSrc;

let PaintGuide = class extends CustomEventSource {
	#fc = new FetchContext("https://www.equestria.dev");
	#ptr;
	#lastEtag;
	#updateOngoing = false;
	x = 0;
	y = 0;
	width = 0;
	height = 0;
	points; // Array of points
	data; // Point cloud created from point array
	whenTemplateReady() {
		let upThis = this;
		return new Promise((r) => {
			if (upThis.#updateOngoing || !upThis.points?.constructor) {
				let processor;
				processor = function () {
					//upThis.removeEventListener("templateupdate", processor);
					r();
				};
				upThis.addEventListener("templateupdate", processor);
			} else {
				r();
			};
		});
	};
	async updateTemplate() {
		if (!this.#updateOngoing) {
			// Get the pointer file
			this.#updateOngoing = true;
			let statusCode = 0, pointer;
			let changed = false;
			try {
				let pointer = await (await this.#fc.fetch(this.#ptr)).json();
				for (let i = 0; i < pointer?.bot?.length; i ++) {
					let url = pointer?.bot[i];
					if (statusCode != 200) {
						let options = await this.#fc.fetch(url, {
							"method": "HEAD"
						});
						statusCode = options.status;
						// Has it been updated yet?
						let etag = options.headers.get("etag");
						if (etag != this.#lastEtag) {
							this.#lastEtag = etag;
							changed = true;
						};
					};
				};
				if (changed) {
					// If yes, rebuild the point cloud!
					console.info(`[PntGuide]  Template update received.`);
					let maskData, botImageData;
					for (let i = 0; i < pointer?.mask?.length; i ++) {
						let url = pointer?.mask[i];
						if (!maskData) {
							let arrayBuffer = await (await this.#fc.fetch(url)).arrayBuffer();
							maskData = UPNG.decode(arrayBuffer);
							arrayBuffer = undefined;
						};
					};
					for (let i = 0; i < pointer?.bot?.length; i ++) {
						let url = pointer?.bot[i];
						if (!botImageData) {
							let arrayBuffer = await (await this.#fc.fetch(url)).arrayBuffer();
							botImageData = UPNG.decode(arrayBuffer);
							arrayBuffer = undefined;
						};
					};
					if (maskData && botImageData) {
						this.x = pointer.offX || 0;
						this.y = pointer.offY || 0;
						if (this.data) {
							delete this.data;
						};
						if (this.points) {
							delete this.points;
						};
						let pointArray = [];
						let maskArr = UPNG.toRGBA8(maskData)[0];
						let botData = UPNG.toRGBA8(botImageData)[0];
						let maskView = new DataView(maskArr);
						let botView = new DataView(botData);
						let width = maskData.width;
						let pixels = 0;
						let prio = 0, r = 0, g = 0, b = 0;
						for (let ri = 0; ri < maskArr.byteLength; ri += 4) {
							let i = ri >> 2;
							prio = maskView.getUint8(ri);
							if (prio > 0) {
								r = botView.getUint8(ri);
								g = botView.getUint8(ri + 1);
								b = botView.getUint8(ri + 2);
								pointArray.push(new Uint16Array([(i % width) + this.x, this.y + Math.floor(i / width), 0, prio, r, g, b]));
								pixels ++;
							};
						};
						this.pixels = pixels;
						this.points = pointArray;
						this.data = new kdTree(pointArray, dim2Dist, [0, 1]);
						console.info(`[PntGuide]  Template build finished. Managing ${pointArray.length} pixels.`);
						//console.info(pixels);
						//console.info(this.data.balanceFactor());
						maskArr = undefined; // Drop it as soon as possible
						delete maskView.buffer;
						maskView = undefined;
						delete botView.buffer;
						botView = undefined;
						delete maskData.data;
						delete maskData.frames;
						delete maskData.tabs;
						maskData = undefined; // Drop!
						delete botData.buffer;
						delete botImageData.data;
						delete botImageData.frames;
						delete botImageData.tabs;
						botImageData = undefined; // Drop!
						botData = undefined; // Again, drop as soon as possible
						maskView = undefined;
						botView = undefined;
						//console.info(this);
						this.dispatchEvent("templateupdate");
					};
				};
			} catch (err) {
				console.info(`[PntGuide]  ETag fetch failed: ${err}`);
			};
			this.#updateOngoing = false;
		};
	};
	constructor(pointer) {
		super();
		this.#ptr = pointer;
	};
};

export {
	PaintGuide
};
