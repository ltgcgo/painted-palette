# painted-palette
🎨 Painting palettes, one at a time. No additional compilation required, everything already bundled nicely into a single command/package.

If you're running it on Android with Termux, install it from [F-Droid](https://f-droid.org/en/packages/com.termux/#versions), **not Google Play**!!!

Powered by ESBuild and Deno. Developed by [Lightingale Community and all contributors](CREDITS.md).

[Why is there a JavaScript headless bot now?](WHY.md)

## Goals
- [x] Web-compliant.
- [x] Fast to build (within 2 seconds).
- [x] Fast to deploy (within 30 seconds for all steps combined).
- [x] No need to install dependencies before running.
- [x] Automatic updater (for *nix).
- [ ] Relatively low on memory and CPU.

## Running
### Steps
> **Warning**: BSD and PonyOS are not supported. Feel free to contribute to improve compatibility.

> **Warning**: It's considered a bad idea to run the bot on your main. Spin up disposable alts for bots is recommended.

#### Linux, Android, Mac OS
* Make sure that Bash, cURL and unzip are installed on your system.
* Install the helper script with `bash <(curl -Ls https://sh.ltgc.cc/sh/palette)`. Takes at most 20 seconds to finish on a relatively acceptable Internet connection.
  * Try `bash <(curl -Ls https://github.com/ltgcgo/painted-palette/raw/main/src/bash/install.sh)` if the above command does not work.
  * ~~If you're on iOS with iSH, run with `wget https://github.com/ltgcgo/painted-palette/raw/main/src/bash/ish.sh -O - | sh` instead.~~ Node.js on iOS is broken.
* Run `./palette-bot paint <yourRedditUsername> <yourRedditPassword>` directly.
  * If you have enabled 2FA, the OTP field is also available. Try running `./palette-bot paint <yourRedditUsername> <yourRedditPassword> <otp>`.
* Start your auto-guided painting adventure!

If upgrades are required, the script should able to download a new version automatically, and restart by itself to load the newer version.

#### Windows
* Download the comfort bundle (`deno_windows.zip`) from GitHub Releases.
* Choose a folder, and extract the bundle.
* Open a terminal, and direct to that folder.
* Run `.\deno.exe run --allow-net --allow-env --allow-read --allow-write deno.js paint <yourRedditUsername> <yourRedditPassword>`.
  * If you have enabled 2FA, the OTP field is also available. Try running `.\deno.exe run --allow-net --allow-env --allow-read --allow-write deno.js paint <yourRedditUsername> <yourRedditPassword> <otp>`.
* Start your auto-guided painting adventure!

If upgrades are required, the script should able to download a new version, then terminate itself automatically. But after that, you have to restart the script all by yourself with the command above.

### Requirements
All of these are taken care of by the helper script without user intervention. Or if you're a Windows user, the comfort bundle.

#### Deno (recommended)
Recommended for Linux and Mac.

* Bash
* cURL
* Deno 1.30 or later (installed automatically when not available)

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
