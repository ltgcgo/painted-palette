#!/bin/bash
export NO_UPDATE=1
bun run dist/bun.js "$@"
exit
