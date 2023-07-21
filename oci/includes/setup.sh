#!/bin/ash
apk add bash
apk add curl
apk add unzip
apk add proxychains-ng
curl -Ls https://github.com/ltgcgo/painted-palette/raw/main/src/bash/install.sh | bash
exit