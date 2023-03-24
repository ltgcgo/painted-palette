"use strict";

import {RedditPubSub} from "./pubsub.js";

let Monalisa = class {
	#context;
	#sessionToken;
	#fallbackToken;
	#refreshToken;
	#x = 1;
	#y = 1;
	ws; // Manged WebSocket
	ps; // Managed PubSub
	cc; // Managed CanvasConfiguration
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
	async refreshSession() {};
	async refreshInfo() {
		// Get user data
		// Get cooldown info
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
		let canvasIndex = (+(y >= 1000) << 1) + +(x >= 1000);
		let canvasX = x % 1000, canvasY = y % 1000;
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
		console.info(`Next pixel in ${(this.nextAt - Date.now()) / 1000} seconds.`);
		return this.nextAt;
	};
	async place() {};
	async startStream() {
		if (!this.ws) {
			this.ws = new WebSocket(`${this.appUrl.replace("http", "ws")}/query`, "graphql-ws");
		};
		let ws = this.ws;
		if (!this.ps) {
			this.ps = new RedditPubSub();
		};
		let ps = this.ps;
		ps.attach(ws);
		ps.addEventListener("data", console.info);
		ps.addEventListener("ack", console.info);
		ps.addEventListener("ka", console.info);
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
		let userRep = await fc.fetch(`${this.appUrl}/svc/mona-lisa/get-user-data`, {
			"headers": {
				"Authorization": session
			}
		});
		if (userRep.status == 200) {
			this.userdata = await userRep.json();
		};
	};
	constructor(browserContext) {
		this.appUrl = browserContext.origin;
		this.#context = browserContext;
	};
};

export {
	Monalisa
};
