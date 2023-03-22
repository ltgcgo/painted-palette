# painted-palette
🎨 Painting palettes, one at a time. No additional compilation required, everything already bundled nicely into a single command/package.

If you're running it on Android with Termux, install it from [F-Droid](https://f-droid.org/en/packages/com.termux/#versions), **not Google Play**!!!

Powered by ESBuild and Deno. No TypeScript used. Developed by Lightingale Community and all contributors.

## Goals
- [x] Web-compliant.
- [x] Fast to build (within 2 seconds).
- [x] Fast to deploy (within 30 seconds for all steps combined).
- [ ] Relatively low on memory and CPU.

## Running
### Steps
#### Linux, Android, Mac OS
Some steps may not be required, if the installation helper script directly supports your distro/platform.

* Install the helper script with `bash <(curl -Ls https://sh.ltgc.cc/sh/palette)`. Takes at most 20 seconds to finish on a relatively acceptable Internet connection.
  * Try `bash <(curl -Ls https://github.com/ltgcgo/painted-palette/raw/main/src/bash/install.sh)` if the above command does not work.
* Run `./palette-bot paint <yourRedditUsername> <yourRedditPassword>` directly.
* Start your auto-guided painting adventure!

If upgrades are required, the script should able to download a new version automatically, and restart by itself to load the newer version.

### Requirements
All of these are taken care of by the helper script without user intervention. Or if you're a Windows user, the comfort bundle.

#### Deno (recommended)
Recommended for Linux and Mac.

* Bash
* cURL
* Deno 1.30 or later

#### Node.js
Recommended for Android (Termux).

* Bash
* cURL
* Node.js 18 or later
* `ws` (installed automatically)

### Development
#### Dependencies
* Deno
* ESBuild
* kd-tree-javascript
* pako.js
* UPNG.js
* ws
* xmldom

#### Sources
* ~~`cnc.js`: The source code for the command and control server.~~
* `core.js`: The core code for the bot.
* `deno.js`: Core code wrapped with Deno interfaces.
* `node.js`: Core code wrapped with Node interfaces.
* `helper.sh`: Spin things up with ease!
