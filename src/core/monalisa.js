"use strict";

import {CustomEventSource} from "../../libs/lightfelt/ext/customEvents.js";
import {dim2Dist, sortDist} from "./common.js";
import {RedditPubSub} from "./pubsub.js";
import KdTreeSrc from "../../libs/kd-tree/kd-tree.js";
let {kdTree, BinaryHeap} = KdTreeSrc;
import {ColourPaletteSpace} from "./colour.js";
import {UPNG} from "../../libs/upng/upng.min.js";
import {deriveHash} from "./derive.js";

let Monalisa = class extends CustomEventSource {
	#context;
	#sessionToken;
	#fallbackToken;
	#refreshToken;
	#x = 0;
	#y = 0;
	#isPlacing = false;
	ws; // Managed WebSocket
	ps; // Managed PubSub
	cc; // Managed CanvasConfiguration
	pg; // Paint Guide
	pp; // Point Partition
	an; // Attached analytics object
	ra; // Attached Reddit authenticator
	psStreams = {
		conf: 0,
		canvas: []
	}; // PubSub streams
	disableStream = false;
	loggedIn = false;
	userdata;
	session;
	appUrl;
	nextAt = 0;
	safeAt = 0;
	setRefresh(token) {
		let fc = this.#context;
		fc.cookies["refresh-token"] = token;
		this.#refreshToken = token;
	};
	setSession(token) {
		let fc = this.#context;
		fc.cookies["session-token"] = token;
		this.#sessionToken = token;
	};
	setFocalPoint(x = 0, y = 0) {
		this.#x = 0;
		this.#y = 0;
	};
	getGraphQlHeaders(bodyLength) {
		return {
			"Authorization": this.#sessionToken,
			"Content-Type": "application/json",
			"Content-Length": bodyLength.toString(),
			"apollographql-client-name": "mona-lisa",
			"apollographql-client-version": "0.0.1"
		};
	};
	whenCcReady() {
		let upThis = this;
		return new Promise((r) => {
			if (upThis.cc) {
				r();
			} else {
				let processor;
				//console.info(`CC new.`);
				processor = function () {
					//upThis.removeEventListener("canvasconfig", processor);
					//console.info(`CC resolve.`);
					r();
				};
				upThis.addEventListener("canvasconfig", processor);
			};
		});
	};
	whenPpReady() {
		let upThis = this;
		return new Promise((r) => {
			if (upThis.pp?.constructor) {
				r();
			} else {
				let processor;
				processor = function () {
					//upThis.removeEventListener("pixelpartition", processor);
					r();
				};
				upThis.addEventListener("pixelpartition", processor);
			};
		});
	};
	async refreshSession() {};
	async refreshInfo() {
		// Get user data
		let userRep = await this.#context.fetch(`${this.appUrl}/svc/mona-lisa/get-user-data`, {
			"headers": {
				"Authorization": this.#sessionToken
			}
		});
		if (userRep.status == 200) {
			this.userdata = await userRep.json();
		};
		// Get cooldown info
		let graphQlBody = `{"operationName":"getUserCooldown","variables":{"input":{"actionName":"r/replace:get_user_cooldown"}},"query":"mutation getUserCooldown($input: ActInput!) {\\n  act(input: $input) {\\n    data {\\n      ... on BasicMessage {\\n        id\\n        data {\\n          ... on GetUserCooldownResponseMessageData {\\n            nextAvailablePixelTimestamp\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}`;
		let graphQlRep = await this.#context.fetch(`${this.appUrl}/query`, {
			"headers": this.getGraphQlHeaders(graphQlBody.length),
			"method": "POST",
			"body": graphQlBody
		});
		let graphQlRaw = await graphQlRep.json();
		this.nextAt = graphQlRaw.data.act.data[0].data.nextAvailablePixelTimestamp;
	};
	async getPixelHistory(x = this.#x, y = this.#y, colourIndex = 0) {
		let canvasIndex = (+(y >= 1000) << 1) + +(x >= 1000);
		let canvasX = x % 1000, canvasY = y % 1000;
		let graphQlBody = `{"operationName":"pixelHistory","variables":{"input":{"actionName":"r/replace:get_tile_history","PixelMessageData":{"coordinate":{"x":${canvasX},"y":${canvasY}},"colorIndex":${colourIndex},"canvasIndex":${canvasIndex}}}},"query":"mutation pixelHistory($input: ActInput!) {\\n  act(input: $input) {\\n    data {\\n      ... on BasicMessage {\\n        id\\n        data {\\n          ... on GetTileHistoryResponseMessageData {\\n            lastModifiedTimestamp\\n            userInfo {\\n              userID\\n              username\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}`;
		//console.info(`${graphQlBody}`);
		let graphQlRep = await await this.#context.fetch(`${this.appUrl}/query`, {
			"headers": this.getGraphQlHeaders(graphQlBody.length),
			"method": "POST",
			"body": graphQlBody
		});
		//console.info(graphQlRep);
		let graphQlRaw = await graphQlRep.json();
		return graphQlRaw.data.act.data[0].data;
	};
	async partitionPixels() {
		if (this.pg) {
			//console.info("Waiting for CanvasConfiguration.");
			await this.whenCcReady();
			//console.info("CanvasConfiguration OK. Waiting for template.");
			await this.pg.whenTemplateReady();
			//console.info("Template OK. Partitioning...");
			delete this.pp;
			let partitionPixels = [];
			// Add canvas ID information to each pixel
			this.pg.points.forEach((e) => {
				let cid = this.cc.canvas.nearest(e.subarray(0, 2), 1)[0][0][2];
				e[2] = cid;
				if (!partitionPixels[cid]?.constructor) {
					partitionPixels[cid] = [];
				};
				partitionPixels[cid].push(e);
			});
			this.pp = partitionPixels;
			this.dispatchEvent("pixelpartition");
		} else {
			console.info("[Monalisa]  Nothing to partition.");
		};
	};
	async rebuildDamageCloud() {
		if (this.pg && this.cc?.data) {
			let damageCloud = [];
			this.pg.points.forEach((e) => {
				// Get point from the canvas cloud
				let pixel = this.cc.data.nearest([e[0], e[1]], 1);
				if (!pixel) {
					console.info(`[Monalisa]  No point found at (${e[0]}, ${e[1]}).`);
					return;
				};
				pixel = pixel[0][0];
				if (pixel[0] != e[0] || pixel[1] != e[1]) {
					//console.info(`[Monalisa]  PG (${e[0]}, ${e[1]}) does not match canvas (${pixel[0]}, ${pixel[1]}).`);
					return;
				};
				if (e[4] != pixel[2] || e[5] != pixel[3] || e[6] != pixel[4] ) {
					//console.info(e);
					//console.info(pixel);
					damageCloud.push(e);
				};
			});
			if (this.cc?.damage) {
				delete this.cc.damage;
			};
			this.cc.damage = new kdTree(damageCloud, dim2Dist, [0, 1]);
			this.cc.damaged = damageCloud.length;
			console.info(`[Monalisa]  ${damageCloud.length}/${this.pg.points.length} pixels damaged.`);
		};
	};
	async focusPixel(x = WingBlade.randomInt(this?.cc?.width || 0), y = WingBlade.randomInt(this?.cc?.height || 0)) {
		this.#x = x;
		this.#y = y;
	};
	async placePixel({x = this.#x, y = this.#y, ci = 0}) {
		if (this.#isPlacing) {
			console.info(`[Monalisa]  Another instance of pixel placing ongoing.`);
			return;
		};
		this.#isPlacing = true;
		try {
			// ci means colour index
			let canvasIndex = this.cc.canvas.nearest([x, y], 1)[0][0][2];
			console.info(`[Monalisa]  Chose canvas ${canvasIndex} for ${x}, ${y}.`);
			let canvasX = x % this.cc.uWidth, canvasY = y % this.cc.uHeight;
			let graphQlBody = `{"operationName":"setPixel","variables":{"input":{"actionName":"r/replace:set_pixel","PixelMessageData":{"coordinate":{"x":${canvasX},"y":${canvasY}},"colorIndex":${ci},"canvasIndex":${canvasIndex}}}},"query":"mutation setPixel($input: ActInput!) {\\n  act(input: $input) {\\n    data {\\n      ... on BasicMessage {\\n        id\\n        data {\\n          ... on GetUserCooldownResponseMessageData {\\n            nextAvailablePixelTimestamp\\n            __typename\\n          }\\n          ... on SetPixelResponseMessageData {\\n            timestamp\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}`;
			//console.info(`${graphQlBody}`);
			let graphQlRep = await await this.#context.fetch(`${this.appUrl}/query`, {
				"headers": this.getGraphQlHeaders(graphQlBody.length),
				"method": "POST",
				"body": graphQlBody
			});
			//console.info(graphQlRep);
			let graphQlRaw = await graphQlRep.json();
			this.nextAt = graphQlRaw.data.act.data[0].data.nextAvailablePixelTimestamp;
			return this.nextAt;
		} catch (err) {
			console.info(`[Monalisa]  Pixel placement failed. ${err}`);
		};
		this.#isPlacing = false;
	};
	async place() {
		if (!this.cc?.damage) {
			console.info(`[Monalisa]  Damage cloud not yet available.`);
			return;
		};
		let timeNow = Date.now();
		if (timeNow <= this.nextAt) {
			console.info(`[Monalisa]  Minimal cooldown not yet finished.`);
			return;
		};
		if (timeNow <= this.safeAt) {
			console.info(`[Monalisa]  Safe cooldown not yet finished.`);
			return;
		};
		let querySize = 81;
		let resultArr = this.cc.damage.nearest([this.#x, this.#y], querySize).sort(sortDist);
		if (resultArr?.length < 1) {
			console.info(`[Monalisa]  Not enough damage.`);
			return;
		};
		// Walk through all matched pixels
		let walkingValue = WingBlade.randomInt(255 * querySize),
		selectedIndex = 0, selectedPixel;
		while (walkingValue > 0) {
			selectedPixel = resultArr[selectedIndex][0];
			walkingValue -= selectedPixel[3];
			selectedIndex ++;
			if (selectedIndex >= resultArr.length) {
				selectedIndex = 0;
			};
		};
		console.info(`[Monalisa]  Focal (${this.#x}, ${this.#y}), selected (${selectedPixel[0]}, ${selectedPixel[1]}).`);
		await this.focusPixel(selectedPixel[0], selectedPixel[1]);
		let colour = this.cc.colours.nearest(selectedPixel.subarray(4, 7));
		if (!colour) {
			console.info(`[Monalisa]  No palette colour available for (${selectedPixel[4]}, ${selectedPixel[5]}, ${selectedPixel[6]}).`);
			return;
		};
		await this.placePixel({ci: colour[3]});
		console.info(`[Monalisa]  Painted (${this.#x}, ${this.#y}) as ${colour[3]}, P(${colour[0], colour[1], colour[2]}) D(${selectedPixel[4]}, ${selectedPixel[5]}, ${selectedPixel[6]}).`);
	};
	async startStream(actuallyResponds) {
		console.info(`[Monalisa]  Connecting to canvas...`);
		let upThis = this;
		if (!this.ws || this.ws.readyState > 1) {
			this.ws = new WebSocket(`${this.appUrl.replace("http", "ws")}/query`, "graphql-ws");
			console.info(`[Monalisa]  New WebSocket connection created.`);
		};
		let ws = this.ws;
		if (!this.ps || this.ws.readyState < 1) {
			this.ps = new RedditPubSub();
			console.info(`[Monalisa]  New PubSub demuxer created.`);
		};
		let ps = this.ps;
		ps.attach(ws);
		/*ps.addEventListener("ack", (ev) => {
			console.info(`Connection acknowledged.`);
		});*/ // Acknowledgement packets
		/*ps.addEventListener("ka", (ev) => {
			console.info(ev.data);
		});*/ // Keep alive packets
		ws.addEventListener("open", (ev) => {
			console.info(`[Monalisa]  Canvas listener started.`);
			ps.start(this.#sessionToken);
			ps.subscribe({
				input: {
					channel: {
						teamOwner: "AFD2022",
						category: "CONFIG"
					}
				},
				operationName: "configuration",
				query: "subscription configuration($input: SubscribeInput!) {\\n subscribe(input: $input) {\\n id\\n ... on BasicMessage {\\n data {\\n __typename\\n ... on ConfigurationMessageData {\\n colorPalette {\\n colors {\\n hex\\n index\\n __typename\\n }\\n __typename\\n }\\n canvasConfigurations {\\n index\\n dx\\n dy\\n __typename\\n }\\n canvasWidth\\n canvasHeight\\n __typename\\n }\\n }\\n __typename\\n }\\n __typename\\n }\\n}\\n",
				callback: (data) => {
					if (!actuallyResponds) {
						return;
					};
					// Full canvas config data
					console.info(`[Monalisa]  ${data.canvasConfigurations.length} canvas(es). ${data.canvasWidth}px by ${data.canvasHeight}px on each.`);
					// Prepare the canvas configuration
					if (!this.cc) {
						this.cc = {};
					};
					let cc = this.cc;
					// Build canvas point cloud
					let canvasPos = new kdTree([], dim2Dist, [0, 1]); // [x, y, canvasId]
					let canvasXy = [];
					data.canvasConfigurations.forEach((e) => {
						let mx = data.canvasWidth - 1, my = data.canvasHeight - 1;
						canvasPos.insert(new Uint16Array([e.dx, e.dy, e.index]));
						canvasPos.insert(new Uint16Array([e.dx, e.dy + my, e.index]));
						canvasPos.insert(new Uint16Array([e.dx + mx, e.dy, e.index]));
						canvasPos.insert(new Uint16Array([e.dx + mx, e.dy + my, e.index]));
						cc.width = Math.max(cc.width || 0, e.dx + data.canvasWidth);
						cc.height = Math.max(cc.height || 0, e.dy + data.canvasHeight);
						canvasXy.push(new Uint16Array([e.dx, e.dy, e.index]));
					});
					cc.canvas = canvasPos;
					cc.cxy = canvasXy;
					cc.uWidth = data.canvasWidth;
					cc.uHeight = data.canvasHeight;
					console.info(`[Monalisa]  The total canvas is ${cc.width}x${cc.height}.`);
					// Build palette point cloud
					cc.colours = new ColourPaletteSpace();
					data.colorPalette.colors.forEach((e) => {
						let r = parseInt(e.hex.slice(1, 3), 16);
						let g = parseInt(e.hex.slice(3, 5), 16);
						let b = parseInt(e.hex.slice(5, 7), 16);
						cc.colours.add(new Uint16Array([r, g, b, e.index]));
					});
					console.info(`[Monalisa]  Palette contains ${data.colorPalette.colors.length} colours.`);
					// Emit event
					this.dispatchEvent("canvasconfig");
					// Subscribe to canvas streams
					canvasXy.forEach((e) => {
						let canvasId = e[2];
						ps.subscribe({
							input: {
								channel: {
									"teamOwner": "AFD2022",
									"category": "CANVAS",
									"tag": `${canvasId}`
								}
							},
							operationName: "replace",
							query: "subscription replace($input: SubscribeInput!) {\\n subscribe(input: $input) {\\n id\\n ... on BasicMessage {\\n data {\\n __typename\\n ... on FullFrameMessageData {\\n __typename\\n name\\n timestamp\\n }\\n ... on DiffFrameMessageData {\\n __typename\\n name\\n currentTimestamp\\n previousTimestamp\\n }\\n }\\n __typename\\n }\\n __typename\\n }\\n}\\n",
							callback: async (data) => {
								if (!actuallyResponds) {
									return;
								};
								let pngBuffer = await (await fetch(data.name)).arrayBuffer();
								delete data.name;
								let pngObject = UPNG.decode(pngBuffer);
								pngBuffer = undefined;
								let pngData = UPNG.toRGBA8(pngObject)[0];
								delete pngObject.data;
								delete pngObject.frames;
								delete pngObject.tabs;
								pngObject = undefined;
								let pngView = new DataView(pngData);
								let offset = canvasXy[canvasId];
								let iteratedPx = 0, validPixels = 0;
								if (!this.pp) {
									await this.whenPpReady();
								};
								this.pp[canvasId]?.forEach(([rx, ry]) => {
									let x = rx % cc.uWidth, y = ry % cc.uHeight;
									let ri = (y * cc.uWidth + x) << 2;
									iteratedPx ++;
									let alpha = pngView.getUint8(ri + 3);
									if (alpha) {
										validPixels ++;
										let rwPixel;
										// Fetch from canvas cloud if there are any
										cc.data = cc.data || new kdTree([], dim2Dist, [0, 1]);
										let retrieved = cc.data?.nearest([rx, ry], 1, 1);
										if (retrieved?.length && retrieved[0][0][0] == rx && retrieved[0][0][1] == ry) {
											// Reuse if there are matche
											rwPixel = retrieved[0][0];
										} else {
											// Insert if there are no match
											rwPixel = new Uint16Array([rx, ry, 0, 0, 0]);
											cc.data.insert(rwPixel);
										};
										// Write RGB data to canvas
										rwPixel[2] = pngView.getUint8(ri),
										rwPixel[3] = pngView.getUint8(ri + 1),
										rwPixel[4] = pngView.getUint8(ri + 2);
										//console.info(rwPixel);
									};
								});
								if (validPixels) {
									console.info(`[Monalisa]  Canvas #${canvasId} updated ${validPixels}/${iteratedPx} pixels.`);
								};
								this.rebuildDamageCloud();
								// Message finish
								pngData = undefined;
								pngView = undefined;
							}
						});
					});
				}
			}); // Listen on canvas config changes
		});
		/*ps.addEventListener("data", (ev) => {
			if (!ev.data.id) {
				return; // Drop all events silently if they do not have pubsub stream IDs
			};
			console.info(JSON.stringify(ev.data.data));
		});*/
		ws.addEventListener("close", async () => {
			// Reconnect if disconnections are detected
			if (!this.disableStream) {
				ps.detach(ws);
				console.info(`[Monalisa]  Canvas stream closed. Restarting in seconds.`);
				await WingBlade.sleep(4000);
				this.startStream(actuallyResponds);
			};
		});
	};
	/*async act() {
		this.startStream();
	};*/
	async stop() {};
	async login({session, fallback, refresh}) {
		if (!session) {
			return "Blank session.";
		};
		this.#fallbackToken = fallback;
		this.setSession(session);
		this.setRefresh(refresh);
		let fc = this.#context;
		let sessionRep = await fc.fetch(`${this.appUrl}/api/session`, {
			"headers": {
				"Authorization": session
			}
		});
		if (sessionRep.status != 200) {
			return sessionRep.statusText;
		};
		let sessionInfo = await sessionRep.json();
		this.setRefresh(sessionInfo.refreshToken);
		this.session = sessionInfo.id;
		this.loggedIn = true;
		await this.refreshInfo();
	};
	constructor(browserContext) {
		super();
		this.appUrl = browserContext.origin;
		this.#context = browserContext;
	};
};

export {
	Monalisa
};
