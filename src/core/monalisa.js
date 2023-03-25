"use strict";

import {CustomEventSource} from "../../libs/lightfelt/ext/customEvents.js";
import {dim2Dist} from "./common.js";
import {RedditPubSub} from "./pubsub.js";
import KdTreeSrc from "../../libs/kd-tree/kd-tree.js";
let {kdTree, BinaryHeap} = KdTreeSrc;
import {ColourPaletteSpace} from "./colour.js";

let Monalisa = class extends CustomEventSource {
	#context;
	#sessionToken;
	#fallbackToken;
	#refreshToken;
	#x = 0;
	#y = 0;
	ws; // Manged WebSocket
	ps; // Managed PubSub
	cc; // Managed CanvasConfiguration
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
				processor = function () {
					r();
					upThis.removeEventListener("canvasconfig", processor);
				};
				upThis.addEventListener("canvasconfig", processor);
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
	async selectPixel() {};
	async placePixel(x = this.#x, y = this.#y, colourIndex = 0) {
		let canvasIndex = this.cc.canvas.nearest([x, y], 1)[0][0][2];
		console.info(`Chosen canvas ${canvasIndex} for ${x}, ${y}.`);
		let canvasX = x % this.cc.uWidth, canvasY = y % this.cc.uHeight;
		let graphQlBody = `{"operationName":"setPixel","variables":{"input":{"actionName":"r/replace:set_pixel","PixelMessageData":{"coordinate":{"x":${canvasX},"y":${canvasY}},"colorIndex":${colourIndex},"canvasIndex":${canvasIndex}}}},"query":"mutation setPixel($input: ActInput!) {\\n  act(input: $input) {\\n    data {\\n      ... on BasicMessage {\\n        id\\n        data {\\n          ... on GetUserCooldownResponseMessageData {\\n            nextAvailablePixelTimestamp\\n            __typename\\n          }\\n          ... on SetPixelResponseMessageData {\\n            timestamp\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n"}`;
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
	};
	async place() {};
	async startStream() {
		if (!this.ws || this.ws.readyState > 1) {
			this.ws = new WebSocket(`${this.appUrl.replace("http", "ws")}/query`, "graphql-ws");
		};
		let ws = this.ws;
		if (!this.ps || this.ws.readyState < 1) {
			this.ps = new RedditPubSub();
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
					// Full canvas config data
					console.info(`There are ${data.canvasConfigurations.length} canvas(es). Each canvas is ${data.canvasWidth} px wide, ${data.canvasHeight} px high.`);
					// Prepare the canvas configuration
					if (!this.cc) {
						this.cc = {};
					};
					let cc = this.cc;
					// Build canvas point cloud
					let canvasPos = new kdTree([], dim2Dist, [0, 1]); // [x, y, canvasId]
					data.canvasConfigurations.forEach((e) => {
						let mx = data.canvasWidth - 1, my = data.canvasHeight - 1;
						canvasPos.insert(new Uint16Array([e.dx, e.dy, e.index]));
						canvasPos.insert(new Uint16Array([e.dx, e.dy + my, e.index]));
						canvasPos.insert(new Uint16Array([e.dx + mx, e.dy, e.index]));
						canvasPos.insert(new Uint16Array([e.dx + mx, e.dy + my, e.index]));
						cc.width = Math.max(cc.width || 0, e.dx + data.canvasWidth);
						cc.height = Math.max(cc.height || 0, e.dy + data.canvasHeight);
					});
					cc.canvas = canvasPos;
					cc.uWidth = data.canvasWidth;
					cc.uHeight = data.canvasHeight;
					console.info(`The total canvas is ${cc.width}x${cc.height}.`);
					// Build palette point cloud
					cc.colours = new ColourPaletteSpace();
					data.colorPalette.colors.forEach((e) => {
						let r = parseInt(e.hex.slice(1, 3), 16);
						let g = parseInt(e.hex.slice(3, 5), 16);
						let b = parseInt(e.hex.slice(5, 7), 16);
						cc.colours.add(new Uint16Array([r, g, b, e.index]));
					});
					console.info(`Palette contains ${data.colorPalette.colors.length} colours.`);
					// Emit event
					this.dispatchEvent("canvasconfig");
				}
			}); // Listen on canvas config changes
		});
		/*ps.addEventListener("data", (ev) => {
			if (!ev.data.id) {
				return; // Drop all events silently if they do not have pubsub stream IDs
			};
			console.info(JSON.stringify(ev.data.data));
		});*/
		ws.addEventListener("close", () => {
			// Reconnect if disconnections are detected
			if (!this.disableStream) {
				ps.detach(ws);
				this.startStream();
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
