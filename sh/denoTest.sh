#!/bin/bash
export NO_UPDATE=1
export TEMPLATE_URL=
deno run --allow-net --allow-env --allow-read --allow-write dist/deno.js "$@"
exit
