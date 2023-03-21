// Painted Palette core code

"use strict";

import {BuildInfo} from "./common.js";

let main = async function (args) {
	let acct = args[1], pass = args[2];
	console.info(`${BuildInfo.name}@${WingBlade.variant} v${BuildInfo.ver}\n`);
	switch (args[0]) {
		case "paint": {
			console.info(`Placing pixels on Reddit.`);
			// Begin the Reddit auth flow
			// Start the painter
			break;
		};
		case "test": {
			console.info(`Placing pixels on test server.`);
			// Begin the test server auth flow
			// Start the painter
			break;
		};
		case "help": {
			// Show help
			console.info(`help       Show this message\npaint      Use the provided credentials to paint on Reddit\ntest       Use the provided credentials to paint on the test server`);
			break;
		};
		default: {
			console.info(`Unknown subcommand ${args[0]}. Execute "help" for help.`);
		};
	};
};

export {
	main
};
