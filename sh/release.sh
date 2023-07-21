#!/bin/bash
shx build
mkdir -p build
rm -rf build/*
cp -r dist/* build
cp -r node_modules build
cp -r package.json build
cp -r conf/include/* build
cp -r src/bash/* build
cp -r src/cmd/* build
cd build
rm -v node_modules/.package-lock.json
tree -ifl node_modules | grep -E "(\\.md|\\.d.ts|\\.yml|LICENSE)" | while IFS= read -r path; do
	rm -v "$path"
done
zip -r9v deno_release.zip deno.js
zip -r9v deno_release.zip palette-bot
zip -r9v deno_release.zip palette-proxy
zip -r9v deno_release.zip palette-tor
zip -r9v deno_release.zip install.sh
zip -r9v deno_release.zip snatkitd.sh
zip -r9v deno_windows.zip deno.js
zip -r9v deno_windows.zip gui.cmd
zip -r9v deno_windows.zip winFix.cmd
#zip -r9v deno_windows.zip deno.exe
zip -r9v node_release.zip node.js
zip -r9v node_release.zip palette-bot
zip -r9v node_release.zip install.sh
zip -r9v node_release.zip palette-proxy
zip -r9v node_release.zip palette-tor
zip -r9v node_release.zip snatkitd.sh
zip -r9v node_release.zip package.json
zip -r9v node_release.zip node_modules
zip -r9v node_windows.zip node.js
zip -r9v node_windows.zip install.sh
zip -r9v node_windows.zip package.json
zip -r9v node_windows.zip node_modules
zip -r9v node_windows.zip webui.cmd
zip -r9v node_windows.zip winFix.cmd
zip -r9v bun_release.zip bun.js
zip -r9v bun_release.zip palette-bot
zip -r9v bun_release.zip palette-proxy
zip -r9v bun_release.zip palette-tor
zip -r9v bun_release.zip install.sh
zip -r9v bun_release.zip snatkitd.sh
cd ..
exit