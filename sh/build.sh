#!/bin/bash
mkdir -p dist
mkdir -p proxy
# Remove the dev files
rm -rv dist/*.js
rm -rv dist/*.mjs
rm -rv dist/*.map
# Build some files ahead of the time
shx live web ${1:---minify} > /dev/null
mv proxy/web.js dist/web.js.txt
# Using esbuild to build all JS files
#esbuild --bundle src/index.js --outfile=dist/index.js --minify --sourcemap
#esbuild --bundle src/index.js --target=es6 --outfile=dist/index.es6.js --minify --sourcemap
ls -1 src | while IFS= read -r dir ; do
	if [ -e "src/${dir}/index.js" ] ; then
		shx live $dir ${1:---minify} > /dev/null
	elif [ -e "src/${dir}/index.mjs" ] ; then
		shx live $dir ${1:---minify} > /dev/null
	fi
done
rm -rv proxy/*.map
# Finalizing most builds
ls -1 src | while IFS= read -r dir ; do
	ext="js"
	if [ -e "src/${dir}/index.mjs" ] ; then
		ext="mjs"
	fi
	if [ -e "src/${dir}/prefix.js" ] ; then
		cat src/${dir}/prefix.js > dist/${dir}.${ext}
	fi
	if [ -e "proxy/${dir}.${ext}" ] ; then
		cat proxy/${dir}.${ext} >> dist/${dir}.${ext}
	fi
done
exit
