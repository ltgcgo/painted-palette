#!/bin/sh
apk update
apk upgrade
apk add bash
apk add curl
curl -Ls https://github.com/ltgcgo/painted-palette/raw/main/src/bash/install.sh | bash
exit
