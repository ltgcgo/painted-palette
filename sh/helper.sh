#!/bin/bash
arg="$@"
args=( "$@" )
cd dist
bash helper.sh "${args[@]}"
exit