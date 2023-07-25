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
	lastColour = "transparent";
	psStreams = {
		conf: 0,
		canvas: []
	}; // PubSub streams
	disableStream = false;
	loggedIn = false;
	wsActive = false;
	userdata;
	username;
	session;
	appUrl;
	colourIndex = -1;
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
			"Authorization": `Bearer ${this.#sessionToken}`,
			"Content-Type": "application/json",
			"Content-Length": bodyLength.toString(),
			"Origin": "https://garlic-bread.reddit.com",
			"Referer": "https://garlic-bread.reddit.com/",
			"Sec-Fetch-Site": "same-site",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Dest": "empty",
			"apollographql-client-name": "garlic-bread",
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
			if (upThis.cc?.pp?.constructor) {
				r();
			} else {
				let processor;
				processor = function () {
					//upThis.removeEventListener("pixelpartition", processor);
					r();
				};
				upThis.addEventListener("pixelpartition", processor);
				// Just freaking fire it
				/* let invoker = setInterval(() => {
					if (upThis.cc?.pp?.constructor) {
						r();
						clearInterval(invoker);
					};
				}, 200); */
			};
		});
	};
	getFocus() {
		return {x: this.#x, y: this.#y};
	};
	async refreshSession() {};
	async refreshInfo() {
		// Get user data
		let userRep = await this.#context.fetch(`${this.appUrl}/svc/mona-lisa/get-user-data`, {
			"headers": {
				"Authorization": `Bearer ${this.#sessionToken}`
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
			"body": graphQlBody,
			"noCookies": true
		});
		//console.info(graphQlRep);
		let graphQlRaw = await graphQlRep.json();
		console.info(graphQlRaw);
		return graphQlRaw?.data?.act?.data[0]?.data;
	};
	async partitionPixels() {
		if (this.pg) {
			console.info("[Monalisa]  Waiting for CanvasConfiguration.");
			await this.whenCcReady();
			console.info("[Monalisa]  CanvasConfiguration OK. Waiting for template.");
			await this.pg.whenTemplateReady();
			console.info("[Monalisa]  Template OK. Partitioning...");
			delete this.cc.pp;
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
			this.cc.pp = partitionPixels;
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
				let snapped = this.cc.colours.nearest(pixel.slice(2, 5));
				if (snapped) {
					// Normal snapping
					if (e[4] != snapped[0] || e[5] != snapped[1] || e[6] != snapped[2] ) {
						//console.info(e);
						//console.info(pixel);
						damageCloud.push(e);
					};
				} else {
					// White out
					if (e[4] != pixel[2] || e[5] != pixel[3] || e[6] != pixel[4] ) {
						//console.info(e);
						//console.info(pixel);
						damageCloud.push(e);
					};
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
	async focusPixel(x = -1, y = -1) {
		if (x < 0) {
			if (this.pg) {
				let point = this.pg.points[this.pg.weightedMap.point([WingBlade.util.randomInt(this.pg?.weightedSum || 0)], true)];
				this.#x = point[0];
				this.#y = point[1];
				console.debug(`[Monalisa]  Conducted a weighted focus.`);
			} else {
				this.#x = WingBlade.util.randomInt(this?.cc?.width || 0);
				this.#y = WingBlade.util.randomInt(this?.cc?.height || 0);
				console.debug(`[Monalisa]  Conducted a random focus.`);
			};
		} else {
			this.#x = x;
			this.#y = y;
		};
		this.dispatchEvent("pixelfocus");
	};
	async placePixel({x = this.#x, y = this.#y, ci = 0}) {
		if (this.#isPlacing) {
			console.info(`[Monalisa]  Another instance of pixel placement ongoing.`);
			return;
		};
		this.#isPlacing = true;
		let result = false;
		try {
			this.dispatchEvent("pixelstart");
			// ci means colour index
			let canvasIndex = this.cc.canvas.nearest([x, y], 1)[0][0][2];
			console.info(`[Monalisa]  Chose canvas ${canvasIndex} for ${x}, ${y}.`);
			let canvasX = x % this.cc.uWidth, canvasY = y % this.cc.uHeight;
			let graphQlBody = `{"operationName":"setPixel","variables":{"input":{"actionName":"r/replace:set_pixel","PixelMessageData":{"coordinate":{"x":${canvasX},"y":${canvasY}},"colorIndex":${ci},"canvasIndex":${canvasIndex}}}},"query":"mutation setPixel($input: ActInput!) {\\n  act(input: $input) {\\n    data {\\n      ... on BasicMessage {\\n        id\\n        data {\\n          ... on GetUserCooldownResponseMessageData {\\n            nextAvailablePixelTimestamp\\n            __typename\\n          }\\n          ... on SetPixelResponseMessageData {\\n            timestamp\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}`;
			//console.info(`${graphQlBody}`);
			//console.info(this.getGraphQlHeaders(graphQlBody.length));
			let graphQlRep, err;
			try {
				//console.info(graphQlBody);
				graphQlRep = await this.#context.fetch(`${this.appUrl}/query`, {
					"headers": this.getGraphQlHeaders(graphQlBody.length),
					"method": "POST",
					"body": graphQlBody,
					// "signal": AbortSignal.timeout(10000),
					"noCookies": true,
					"oneshot": true
				});
			} catch (error) {
				err = error;
			};
			//console.info(graphQlRep);
			this.#isPlacing = false;
			if (graphQlRep?.status < 400) {
				let graphQlRaw = await graphQlRep.json();
				console.info(JSON.stringify(graphQlRaw));
				if (graphQlRaw.errors) {
					// Parse nextAt
					graphQlRaw.errors?.forEach((e) => {
						if (e?.extensions?.nextAvailablePixelTs) {
							this.nextAt = e.extensions.nextAvailablePixelTs;
							if (this.nextAt - Date.now() > 1800000) {
								// Possible bans
								console.info(`[Monalisa]  Possible pixel placement ban detected. Next pixel placement taking place at "${new Date(this.nextAt)}".`);
								this.dispatchEvent("pixelfail");
								this.dispatchEvent("pixelban");
							};
						};
					});
				} else {
					this.nextAt = graphQlRaw.data.act.data[0].data.nextAvailablePixelTimestamp;
					this.colourIndex = ci;
					result = true;
					this.dispatchEvent("pixelsuccess");
				};
			} else {
				console.info(`[Monalisa]  Placement failed: ${graphQlRep.status || err?.name || "CustomError"} ${graphQlRep.statusText || err?.message || "Request crashed"}`);
				console.info(graphQlRep ? await graphQlRep.text() : err?.stack || "Request crashed for unknown reasons.");
				this.dispatchEvent("pixelfail");
			};
			this.#isPlacing = false;
			//console.info(await this.getPixelHistory(x, y, ci));
		} catch (err) {
			console.info(`[Monalisa]  Pixel placement failed. ${err}`);
			this.dispatchEvent("pixelfail");
		};
		this.#isPlacing = false;
		return result;
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
		let querySize = 25;
		let resultArr = this.cc.damage.nearest([this.#x, this.#y], querySize).sort(sortDist);
		if (resultArr?.length < 1) {
			console.info(`[Monalisa]  Not enough damage.`);
			return;
		};
		// Walk through all matched pixels
		let walkingValue = WingBlade.util.randomInt(255 * querySize),
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
		let beforePlacement = await this.getPixelHistory(this.#x, this.#y, colour[3]);
		//console.info(beforePlacement);
		this.lastColour = `rgba(${colour[0]},${colour[1]},${colour[2]})`;
		if (await this.placePixel({ci: colour[3]})) {
			this.cc.damage.remove(selectedPixel);
			this.cc.damaged --;
			console.info(`[Monalisa]  Painted (${this.#x}, ${this.#y}) as ${colour[3]}, P(${colour[0], colour[1], colour[2]}) D(${selectedPixel[4]}, ${selectedPixel[5]}, ${selectedPixel[6]}).`);
			await WingBlade.util.sleep(600);
			let afterPlacement = await this.getPixelHistory(this.#x, this.#y, colour[3]);
			//console.info(afterPlacement);
			if (afterPlacement?.userInfo?.username == this.username) {
				// Confirmed placement
				this.dispatchEvent("pixelconfirm");
				console.info(`[Monalisa]  Pixel placement confirmed for user ${this.username}!`);
			} else {
				if (afterPlacement.lastModifiedTimestamp != beforePlacement.lastModifiedTimestamp) {
					// The canvas was overwritten
					this.dispatchEvent("pixeloverwrite");
					console.info(`[Monalisa]  Weak pixel contradiction for user ${this.username}!`);
					console.info(`[Monalisa]  Before: ${JSON.stringify(beforePlacement)}`);
					console.info(`[Monalisa]  After: ${JSON.stringify(afterPlacement)}`);
				} else {
					// The canvas hasn't changed at all
					this.dispatchEvent("pixelcontradict");
					console.info(`[Monalisa]  Strong pixel contradiction for user ${this.username}!`);
					console.info(`[Monalisa]  Before: ${JSON.stringify(beforePlacement)}`);
					console.info(`[Monalisa]  After: ${JSON.stringify(afterPlacement)}`);
				};
			};
			console.info(`[Monalisa]  Failed to paint (${this.#x}, ${this.#y}) as ${colour[3]}, P(${colour[0], colour[1], colour[2]}) D(${selectedPixel[4]}, ${selectedPixel[5]}, ${selectedPixel[6]}).`);
		};
	};
	async startStream(actuallyResponds) {
		if (this.wsActive) {
			console.info(`[Monalisa]  Another WS stream is already active.`);
			return;
		};
		console.info(`[Monalisa]  ${['Dud', 'Real'][+actuallyResponds]} canvas stream created.`);
		this.disableStream = false;
		console.info(`[Monalisa]  Connecting to canvas...`);
		let upThis = this;
		//console.info(this);
		let targetEndpoint = `${this.appUrl.replace("http", "ws")}/query`;
		if (!this.ws || this.ws.readyState > 1) {
			/* let headers = {};
			for (let header in this.#context.globalHeaders) {
				switch (header) {
					case "Sec-Fetch-User": {
						break;
					};
					case "Accept-Encoding": {
						headers["Cache-Control"] = "no-cache";
						break;
					};
					case "Upgrade-Insecure-Requests": {
						headers["Pragma"] = "no-cache";
						break;
					};
					case "Accept": {*/
						// headers[header] = "*/*";
						/* break;
					};
					default: {
						headers[header] = this.#context.globalHeaders[header];
					};
				};
			}; */
			let finishRequest = function (request, websocket) {
				//console.info(request);
				//console.info(websocket);
			};
			this.ws = new WebSocket(targetEndpoint, "graphql-ws", {
				origin: "https://garlic-bread.reddit.com"
			});
			//console.info(this.ws);
			console.info(`[Monalisa]  New WebSocket connection created.`);
		};
		let ws = this.ws;
		if (!this.ps || this.ws.readyState < 1) {
			this.ps = new RedditPubSub();
			console.info(`[Monalisa]  New PubSub demuxer created.`);
		};
		let ps = this.ps;
		try {
			ps.attach(ws);
		} catch (err) {
			console.info(`[Monalisa]  Demuxer attach error. ${err}`);
			return;
		};
		/*ps.addEventListener("ack", (ev) => {
			console.info(`Connection acknowledged.`);
		});*/ // Acknowledgement packets
		/*ps.addEventListener("ka", (ev) => {
			console.info(ev.data);
		});*/ // Keep alive packets
		let lastCanvasUpdate = Date.now();
		(async () => {
			// Globally enforced canvas refreshes
			await WingBlade.util.sleep(1200000, 600000);
			console.info(`[Monalisa]  Forced WebSocket close for canvas refresh.`);
			ws.close();
		})();
		ws.addEventListener("open", (ev) => {
			upThis.wsActive = true;
			console.info(`[Monalisa]  Canvas listener started.`);
			ps.start(this.#sessionToken);
			console.info(`[Monalisa]  Authentication information sent.`);
			ps.subscribe({
				input: {
					channel: {
						teamOwner: "GARLICBREAD",
						category: "CONFIG"
					}
				},
				operationName: "configuration",
				query: "subscription configuration($input: SubscribeInput!) {\n  subscribe(input: $input) {\n    id\n    ... on BasicMessage {\n      data {\n        __typename\n        ... on ConfigurationMessageData {\n          colorPalette {\n            colors {\n              hex\n              index\n              __typename\n            }\n            __typename\n          }\n          canvasConfigurations {\n            index\n            dx\n            dy\n            __typename\n          }\n          activeZone {\n            topLeft {\n              x\n              y\n              __typename\n            }\n            bottomRight {\n              x\n              y\n              __typename\n            }\n            __typename\n          }\n          canvasWidth\n          canvasHeight\n          adminConfiguration {\n            maxAllowedCircles\n            maxUsersPerAdminBan\n            __typename\n          }\n          __typename\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}\n",
				callback: (data) => {
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
					cc.offsetX = data.activeZone?.topLeft?.x || 0;
					cc.offsetY = data.activeZone?.topLeft?.y || 0;
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
					this.partitionPixels();
					// Emit event
					this.dispatchEvent("canvasconfig");
					// Subscribe to canvas streams
					canvasXy.forEach((e) => {
						let canvasId = e[2];
						//console.info(`[Monalisa]  Subscribing to canvas #${canvasId}...`);
						ps.subscribe({
							input: {
								channel: {
									"teamOwner": "GARLICBREAD",
									"category": "CANVAS",
									"tag": `${canvasId}`
								}
							},
							operationName: "replace",
							query: "subscription replace($input: SubscribeInput!) {\n  subscribe(input: $input) {\n    id\n    ... on BasicMessage {\n      data {\n        __typename\n        ... on FullFrameMessageData {\n          __typename\n          name\n          timestamp\n        }\n        ... on DiffFrameMessageData {\n          __typename\n          name\n          currentTimestamp\n          previousTimestamp\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}\n",
							callback: async (data) => {
								if (!actuallyResponds) {
									return;
								};
								//console.info(`[Monalisa]  Canvas #${canvasId} received frame data.`);
								/*if (!actuallyResponds) {
									return;
								};*/
								let probability = ((Date.now() - lastCanvasUpdate) / 1000) * (WingBlade.rt.os == "windows" ? 3 : 1.5);
								lastCanvasUpdate = Date.now();
								if (probability > 1) {
									probability = 1;
								} else if (probability < 0) {
									probability = 0;
								};
								probability = 1 - probability;
								//console.info(`${probability * 100}%`);
								if (data["__typename"] == "DiffFrameMessageData" && Math.random() < probability) {
									//console.info(`[Monalisa]  Skipped ${data["__typename"]} PNG buffer: ${probability * 100}%.`);
									return;
								};
								let pngRequest = await upThis.#context.fetch(data.name, {init: "browser", oneshot: true});
								/* if (data["__typename"] == "FullFrameMessageData") {
									console.info(`${data["__typename"]} ${data.name}`);
								}; */
								// Node.js failover
								if (!pngRequest) {
									console.info(`[Monalisa]  Skipped ${data["__typename"]} PNG buffer due to fetch errors.`);
									return;
								};
								if (!pngRequest.ok) {
									console.info(`[Monalisa]  Invalid ${data["__typename"]} PNG buffer for canvas (#${canvasId}).`);
									return;
								};
								let pngBuffer = await pngRequest.arrayBuffer();
								//delete data.name;
								//console.info(`PNG buffer fetched (${data.name}). Size: ${pngBuffer.byteLength}`);
								let pngObject = UPNG.decode(pngBuffer);
								//console.info(`[Monalisa]  PNG buffer decoded (${data.name}).`);
								pngBuffer = undefined;
								let pngData = UPNG.toRGBA8(pngObject)[0];
								delete pngObject.data;
								delete pngObject.frames;
								delete pngObject.tabs;
								pngObject = undefined;
								//console.info(`[Monalisa]  Canvas #${canvasId} decoded frame data. Waiting for point partitioning...`);
								let pngView = new DataView(pngData);
								let offset = canvasXy[canvasId];
								let iteratedPx = 0, validPixels = 0;
								if (!this.cc.pp) {
									await this.whenPpReady();
								};
								//console.info(`[Monalisa]  Canvas #${canvasId} is ready to parse pixels.`);
								this.cc.pp[canvasId]?.forEach(([rx, ry]) => {
									//let ox = rx - 1000, oy = ry - 500;
									//console.debug(canvasIdx, ox, oy);
									let x = rx % cc.uWidth, y = ry % cc.uHeight;
									let ri = (y * cc.uWidth + x) << 2;
									iteratedPx ++;
									let alpha = pngView.getUint8(ri + 3);
									if (alpha) {
										validPixels ++;
										let rwPixel;
										//let rx = ox, ry = oy;
										// Fetch from canvas cloud if there are any
										cc.data = cc.data || new kdTree([], dim2Dist, [0, 1]);
										let retrieved = cc.data?.nearest([rx, ry], 1, 1);
										if (retrieved?.length && retrieved[0][0][0] == rx && retrieved[0][0][1] == ry) {
											// Reuse if there are matches
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
								pngData = undefined;
								pngView = undefined;
								if (validPixels) {
									console.info(`[Monalisa]  Canvas #${canvasId} updated ${validPixels}/${iteratedPx} pixels.`);
								};
								await this.rebuildDamageCloud();
								// Message finish
							}
						});
					});
				}
			}); // Listen on canvas config changes
		});
		ws.addEventListener("error", async (data) => {
			console.info(`[Monalisa]  WebSocket connection error: ${data.data}`);
			console.debug(data);
			//console.debug(ws);
		});
		/*ws.addEventListener("message", (ev) => {
			console.info(JSON.stringify(ev.data));
		});*/
		ws.addEventListener("close", async () => {
			// Reconnect if disconnections are detected
			if (!this.disableStream) {
				ps.detach(ws);
				upThis.wsActive = false;
				console.info(`[Monalisa]  Canvas stream closed. Restarting in seconds.`);
				await WingBlade.util.sleep(4000);
				this.startStream(actuallyResponds);
			};
		});
	};
	/*async act() {
		this.startStream();
	};*/
	async stopStream() {
		this.disableStream = true;
		this.ws = undefined;
		this.ps = undefined;
		return this.ws?.close();
	};
	async login({session, fallback, refresh}) {
		//console.debug({session, fallback, refresh});
		if (!session) {
			return "Blank session.";
		};
		this.#fallbackToken = fallback;
		this.setSession(session);
		this.setRefresh(refresh);
		let fc = this.#context;
		/*let sessionRep = await fc.fetch(`${this.appUrl}/api/session`, {
			"headers": {
				"Authorization": session
			}
		});
		if (!sessionRep) {
			return "Request crashed.";
		};
		if (sessionRep.status != 200) {
			return sessionRep.statusText;
		};
		let sessionInfo = await sessionRep.json();
		this.setRefresh(sessionInfo.refreshToken);
		this.session = sessionInfo.id;*/
		//await this.refreshInfo();
		this.loggedIn = true;
	};
	async logout() {};
	constructor(browserContext) {
		super();
		this.appUrl = browserContext.origin;
		this.#context = browserContext;
	};
};

export {
	Monalisa
};
