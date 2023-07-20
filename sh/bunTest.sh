#!/bin/bash
export NO_UPDATE=1
export TEMPLATE_URL=
bun run dist/bun.js "$@"
exit
