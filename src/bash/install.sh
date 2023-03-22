#!/bin/bash
installVer=
sysArch=x86_64
if [ -e "$(which denoi)" ] ; then
	installVer=deno
	echo "Deno is found."
elif [ -e "$(which nodei)" ] ; then
	installVer=node
	echo "Node is found."
else
	if [ "$TERMUX_VERSION" != "" ] ; then
		installVer=node
		echo "Termux detected. Installing Node.js on Termux..."
		apt update
		apt install nodejs
		echo "Node installation finished."
	else
		installVer=deno
		echo "Generic POSIX environment detected."
		echo "If you're seeing this message on Termux, you must re-install Termux from F-Droid."
		sysPlat=unknown-linux-gnu
		# Mac-OS detection env dump from JayB
		if [ "$TERM_PROGRAM" == "Apple_Terminal" ] || [ "$(uname -sm)" == "Darwin x86_64" ] ; then
			sysPlat=apple-darwin
			if [ "$(uname -sm)" == "Darwin arm64" ] ; then
				sysArch=aarch64
			fi
		fi
		echo "Downloading Deno..."
		curl -Lo denoPack.zip "https://github.com/denoland/deno/releases/latest/download/deno-${sysArch}-${sysPlat}.zip"
		unzip denoPack.zip
		rm denoPack.zip
		chmod +x deno
	fi
fi
if [ "$installVer" == "deno" ] ; then
	echo "Downloading the Deno bundle for the first run..."
	curl -Lo release.zip "https://github.com/ltgcgo/painted-palette/releases/latest/download/deno_release.zip"
elif [ "$installVer" == "node" ] ; then
	echo "Downloading the Node bundle for the first run..."
	curl -Lo release.zip "https://github.com/ltgcgo/painted-palette/releases/latest/download/node_release.zip"
else
	echo "You've stepped into the realm of oblivion! (No runtime found!)"
fi
if [ "$installVer" != "" ] ; then
	unzip release.zip
	rm release.zip
	chmod +x palette-bot
	echo "Installation finished. Run the following command for help."
	echo "./palette-bot help"
else
	echo "Submit a bug report if you think your platform should get supported by the installer."
fi
exit
