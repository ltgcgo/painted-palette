#!/bin/bash
export LISTEN_PORT=8005
deno run --allow-net --allow-env src/deno_${1:-std}/index.js
exit
