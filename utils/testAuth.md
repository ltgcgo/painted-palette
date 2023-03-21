### `GET /`
Returns `Set-Cookie` with `fallback-session-token`.

### `GET /auth/discord?code=${code}`
Returns `Set-Cookie` with `session-token` and `refresh-token`.

### `GET /api/sesion`
Needs `Authorization` with `Cookie` (`fallback-session-token`, `session-token`, `refresh-token`). A `Referer` would be nice.

```js
{
	id: String, // Base64
	refreshToken: String, // Base64
	userId: String, // Number
	expires: Number // Unix timestamp for expiration
}
```

### `GET /svc/mona-lisa/get-user-data`
Needs `Authorization` with `Cookie` (`fallback-session-token`, `session-token`, `refresh-token`). A `Referer` would be nice.

Send: `Content-Type: application/json`

```js
{
	readonlyMode: Boolean,
	canParticipate: Boolean,
	isEmployee: Boolean,
	id: String // returned from /api/session as userId
}
```

### `POST /query`
Send: `Content-Type: application/json`

#### `getUserCooldown`
```json
{
	"operationName": "getUserCooldown",
	"variables": {
		"input": {
			"actionName": "r/replace:get_user_cooldown"
		}
	},
	"query": "mutation getUserCooldown($input: ActInput!) {\n  act(input: $input) {\n    data {\n      ... on BasicMessage {\n        id\n        data {\n          ... on GetUserCooldownResponseMessageData {\n            nextAvailablePixelTimestamp\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
}
```

```json
{
	"data": {
		"act": {
			"data": [{
				"id": "",
				"data": {
					"nextAvailablePixelTimestamp": 1679395841173,
					"__typename": "GetUserCooldownResponseMessageData"
				},
				"__typename": "BasicMessage"
			}],
			"__typename": "ActResponse"
		}
	}
}
```

#### `pixelHistory`
```json
{
	"operationName": "pixelHistory",
	"variables": {
		"input": {
			"actionName": "r/replace:get_tile_history",
			"PixelMessageData": {
				"coordinate": {
					"x": 749,
					"y": 385
				},
				"colorIndex": 0,
				"canvasIndex": 0
			}
		}
	},
	"query": "mutation pixelHistory($input: ActInput!) {\n  act(input: $input) {\n    data {\n      ... on BasicMessage {\n        id\n        data {\n          ... on GetTileHistoryResponseMessageData {\n            lastModifiedTimestamp\n            userInfo {\n              userID\n              username\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
}
```

```json
{
	"data": {
		"act": {
			"data": [{
				"id": "DcDnIJYkWzbFJdsPWS2UBdNbe6u4oUvs",
				"data": {
					"lastModifiedTimestamp": null,
					"userInfo": {
						"userID": null,
						"username": null,
						"__typename": "UserInfo"
					},
					"__typename": "GetTileHistoryResponseMessageData"
				},
				"__typename": "BasicMessage"
			}],
			"__typename":"ActResponse"
		}
	}
}
```
#### `setPixel`
```json
{
	"operationName": "setPixel",
	"variables": {
		"input": {
			"actionName": "r/replace:set_pixel",
			"PixelMessageData": {
				"coordinate": {
					"x": 747,
					"y": 342
				},
				"colorIndex": 7,
				"canvasIndex": 2
			}
		}
	},
	"query": "mutation setPixel($input: ActInput!) {\n  act(input: $input) {\n    data {\n      ... on BasicMessage {\n        id\n        data {\n          ... on GetUserCooldownResponseMessageData {\n            nextAvailablePixelTimestamp\n            __typename\n          }\n          ... on SetPixelResponseMessageData {\n            timestamp\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
}
```

```json
{
	"data": {
		"act": {
			"data": [{
				"id": "iFs45nXgWaSORWDlczxpIYwmE1v8uTw7",
				"data": {
					"nextAvailablePixelTimestamp": 1679399593549,
					"__typename": "GetUserCooldownResponseMessageData"
				},
				"__typename": "BasicMessage"
			}, {
				"id": "D3Q-3USXCHg6r26qKuidycufleA2e_Sn",
				"data": {
					"timestamp": 1679399588549,
					"__typename":"SetPixelResponseMessageData"
				},
				"__typename": "BasicMessage"
			}],
			"__typename":"ActResponse"
		}
	}
}
```

### `WS /query`
Uses the PubSub model.

#### Send
##### `connection_init`
Initializes the connection.

```js
{
	type: "connection_init",
	payload: {
		Authorization: String // session-token
	}
}
```

##### `start`
Begins subscribing to data streams.

```js

```

##### `stop`
Ends subscribing to data streams.

#### Receive
##### `data`
##### `connection_ack`
##### `ka`

#### Data streams
