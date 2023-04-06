# painted-palette
🎨 Painting palettes, one at a time. One single brush, multiple easels to paint on.

No additional compilation required, everything already bundled nicely into a single command/package.

If you're running it on Android with Termux, install it from [F-Droid](https://f-droid.org/en/packages/com.termux/#versions), **not Google Play**!!!

Powered by ESBuild and Deno. Developed by [Lightingale Community and all contributors](CREDITS.md).

[Why is there a JavaScript headless bot now?](WHY.md)

## Goals
- [x] Web-compliant.
- [x] Fast to build (within 2 seconds).
- [x] Fast to deploy (within 30 seconds for all steps combined).
- [x] Easy to deploy (anyone can run it).
- [x] No need to install dependencies before running.
- [x] Automatic updater.
- [x] Relatively low on memory and CPU.

## Running
### Steps
> **Warning**: Only Deno supports proxies. Node.js does not respect proxy settings.

> **Warning**: BSD, iOS and PonyOS are not supported. Feel free to contribute to improve compatibility.

> **Warning**: It's considered a bad idea to run the bot on your main. Spin up disposable alts for bots is recommended.

#### Linux, Android, Mac OS
* Make sure that Bash, cURL and unzip are installed on your system.
* Install the helper script with `bash <(curl -Ls https://sh.ltgc.cc/sh/palette)`. Takes at most 20 seconds to finish on a relatively acceptable Internet connection.
  * Try `bash <(curl -Ls https://github.com/ltgcgo/painted-palette/raw/main/src/bash/install.sh)` if the above command does not work.
* How would you like to run it?
  * If you just need it to manage a single account, run `./palette-bot paint <yourRedditUsername> <yourRedditPassword>` directly.
    * If you have enabled 2FA, the OTP field is also available. Try running `./palette-bot paint <yourRedditUsername> <yourRedditPassword> <otp>`.
  * If you need it to manage multiple, or just want a nice GUI, run `./palette-bot batch`. You can specify a port for it to listen on, but it'd be on `14514` by default.
    * If you don't know much about commands, just use your favourite browser and click on that URL it shows. You can do everything there.
    * If you prefer CLI, use `./palette-bot ctl`. Set the custom port number as the `PORT` environment variable if you have that defined. Help is available with `./palette-bot help ctl`.
  * What if you want to have more than 5 accounts going, or just want to hide your IP to Reddit?
    * If you don't know much about commands, replace `./palette-bot` in the examples above with `./palette-proxy`. It will do everything for you automatically, just do not manage more than 30 accounts this way. This will considered as a "standalone proxy" by the program.
    * Or if you want to use Tor IPs instead of relatively cleaner IPs,  replace `./palette-bot` with `./palette-tor`. Same as above, only this time you can manage as much as you want. Beware that accounts managed this way may be flagged as bots earlier.
    * If you want to specify an **HTTP** proxy for it to connect, set both the `HTTP_PROXY` and `HTTPS_PROXY` environment variables before running. This will considered as a "system proxy" by the program. If you want to manage more than 30 accounts, go this route for the rest of your accounts.
* Start your auto-guided painting adventure!

If upgrades are required, the script should able to download a new version automatically, and restart by itself to load the newer version. It can pretty much manage everything all by itself, unless something drastic happens.

#### Windows
* Download the comfort bundle (`deno_windows.zip`) from GitHub Releases.
* Choose a folder, and extract the bundle.
<!--* Open a terminal, and direct to that folder.
* Run `.\deno.exe run --allow-net --allow-env --allow-read --allow-write deno.js paint <yourRedditUsername> <yourRedditPassword>`.
  * If you have enabled 2FA, the OTP field is also available. Try running `.\deno.exe run --allow-net --allow-env --allow-read --allow-write deno.js paint <yourRedditUsername> <yourRedditPassword> <otp>`.-->
* Double click to run `gui.cmd`.
* Open the URL it spat out in your browser of choice.
* Start your auto-guided painting adventure!

If upgrades are required, you have to restart the script all by yourself by running `gui.cmd` again.

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
