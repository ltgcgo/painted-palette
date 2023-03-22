#!/bin/sh
apk update
apk upgrade
apk add bash
apk add curl
bash <(curl -Ls https://github.com/ltgcgo/painted-palette/raw/main/src/bash/install.sh)
exit
