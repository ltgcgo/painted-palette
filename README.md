# painted-palette
🎨 Painting palettes, one at a time.

No additional compilation required, since everything is bundled nicely into a single package.

If you run it on Termux, install it from [F-Droid](https://f-droid.org/en/packages/com.termux/#versions), **not Google Play**!!!

Powered by ESBuild. No TypeScript required. Developed by Lightingale Community MLP Fandom Service and all contributors.

## Goals
- [ ] Web-compliant.
- [ ] Fast to build (within 2 seconds).
- [ ] Fast to deploy.
- [ ] Relatively low on memory and CPU.

## Running
### Development
#### Dependencies
* Deno
* ESBuild
* pako.js
* UPNG.js
* ws
* xmldom

#### Sources
* `cnc.js`: The source code for the command and control server.
* `core.js`: The core code for the bot.
* `deno.js`: Core code wrapped with Deno interfaces.
* `node.js`: Core code wrapped with Node interfaces.
* `helper.sh`: Spin things up with ease!

### Requirements
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

### Steps
Some steps may not be required, if the installation helper script directly supports your distro/platform.

* Install Deno (recommended, [see the steps](https://deno.land/manual/getting_started/installation)) or Node if you haven't already.
* Install the helper script with `bash <(curl -Ls https://sh.ltgc.cc/sh/palette)`.
* Run `./palette-bot` directly.
* Enter your account username and password.
* Start your auto-guided painting adventure!

If upgrades are required, the script should able to download a new version automatically, and restart by itself to load the newer version.