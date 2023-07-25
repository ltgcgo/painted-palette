#!/bin/bash
export NO_UPDATE=1
deno run --allow-net --allow-env --allow-read --allow-write dist/deno.js "$@"
exit
