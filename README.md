# painted-palette
🎨 Painting palettes, one at a time. One single brush, multiple easels to paint on.

No additional compilation required, everything already bundled nicely into a single command/package.

If you're running it on Android with Termux, install it from [F-Droid](https://f-droid.org/en/packages/com.termux/#versions), **not Google Play**!!!

Powered by ESBuild and Deno. Developed by [Lightingale Community and all contributors](CREDITS.md).

<!--[Why is there a JavaScript headless bot now?](WHY.md)-->

## Goals
- [x] Web-compliant.
- [x] Fast to build (within 2 seconds).
- [x] Fast to deploy (within 30 seconds for all steps combined).
- [x] Easy to deploy (anyone can run it).
- [x] No need to install dependencies before running.
- [x] Automatic updater.
- [x] Relatively low on memory and CPU.

## Installation and running
Please visit [kb.ltgc.cc](https://kb.ltgc.cc/painted/).

### Requirements
All of these are taken care of by the helper script without user intervention. Or if you're a Windows user, the comfort bundle.

#### Deno (recommended)
Recommended for Linux and Mac.

* Bash
* cURL
* Deno 1.30 or later (installed automatically when not available)

#### Bun
Usable on Linux and Mac.

* Bash
* cURL
* Bun 0.6.14 or later

#### Node.js
Recommended for Android (Termux).

* Bash
* cURL
* Node.js 18 or later
* `ws` (installed automatically)
* `undici` (installed automatically)

### Development
#### Dependencies
* Deno
* ESBuild
* kd-tree-javascript
* Mint Flower/Flame
* pako.js
* UPNG.js
* uuid
* ws
* xmldom

#### Sources
* ~~`cnc.js`: The source code for the command and control server.~~
* `core.js`: The core code for the bot.
* `deno.js`: Core code wrapped with Deno interfaces.
* `node.js`: Core code wrapped with Node interfaces.
* `helper.sh`: Spin things up with ease!
