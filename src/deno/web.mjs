// Copyright (c) Lightingale WingBlade Author(s) 2023.
// Licensed under GNU LGPL 3.0 or later.

"use strict";

import {serve} from "../../libs/denoServe/server.js";

import pageError from "../shared/error.htm";

// Web interfaces
let web = class {
	static serve(handler, opt = {}) {
		let cwdPath = `file://${Deno.cwd()}`;
		if (!opt?.onListen) {
			opt.onListen = function ({port, hostname}) {
				if (hostname == "0.0.0.0") {
					hostname = "127.0.0.1";
				};
				console.error(`WingBlade serving at http://${hostname}:${port}`);
			};
		};
		if (!opt?.hostname) {
			opt.hostname = "0.0.0.0";
		};
		if (!opt?.port) {
			opt.port = 8000;
		};
		return serve(async (request, connInfo) => {
			try {
				let response = await handler(request, connInfo);
				if (response?.constructor == Response) {
					return response;
				} else {
					return new Response(JSON.stringify(response), {
						headers: {
							"Content-Type": "text/plain"
						}
					});
				};
			} catch (err) {
				console.error(`Request error at ${request.method} ${request.url}\n${err.stack}`);
				return new Response(pageError.replace("${runtime}", WingBlade.rt.variant).replace("${stackTrace}", err.stack.replaceAll(cwdPath, "wingblade:app")), {
					status: 502,
					headers: {
						"Content-Type": "text/html"
					}
				});
			};
		}, opt);
	};
	static acceptWs(req, opt) {
		return Deno.upgradeWebSocket(req, opt);
	};
};

export default web;
