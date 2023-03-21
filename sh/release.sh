#!/bin/bash
shx build
mkdir -p build
rm -rf build/*
cp -r dist/* build
cp -r node_modules build
cp -r package.json build
rm build/node_modules/.package-lock.json
cd build
zip -r9v deno_release.zip deno.js
zip -r9v deno_release.zip palette-bot
zip -r9v node_release.zip node.js
zip -r9v deno_release.zip palette-bot
zip -r9v node_release.zip package.json
zip -r9v node_release.zip node_modules
cd ..
exit