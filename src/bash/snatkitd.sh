#!/bin/bash
PATH=./:$PATH

# Installation
transArch=$(uname -m)
case $transArch in
	"x86_64")
		transArch="amd64"
		;;
	"arm" | "armv7l" | "armhf")
		transArch="arm"
		;;
	"arm64" | "armv8l" | "aarch64")
		transArch="arm64"
		;;
esac
if [ -e "$(which hola)" ] ; then
	echo "Hola is already installed."
else
	echo Downloading Hola...
	curl -Lo hola https://github.com/Snawoot/hola-proxy/releases/latest/download/hola-proxy.linux-${transArch}
	chmod +x hola
fi
if [ -e "$(which opera)" ] ; then
	echo "Opera is already installed."
else
	echo Downloading Opera...
	curl -Lo opera https://github.com/Snawoot/opera-proxy/releases/latest/download/opera-proxy.linux-${transArch}
	chmod +x opera
fi
# Running

selectContinent=UN
selectCountry=un
selectProxy=trash
selectPort=0

nacc=("ca" "us")
naccs=${#nacc[@]}
eucc=("be" "bg" "ch" "cz" "de" "dk" "fi" "fr" "gb" "gr" "hr" "ie" "is" "it" "nl" "pl" "ro" "se" "sk")
euccs=${#eucc[@]}
ccpool=("ca" "us" "be" "bg" "ch" "cz" "de" "dk" "fi" "fr" "gb" "gr" "hr" "ie" "is" "it" "nl" "pl" "ro" "se" "sk")
ccs=${#ccpool[@]}
cnpool=("AM" "EU")
cns=${#cnpool[@]}
proxy=("hola" "opera")
proxies=${#proxy[@]}

function switchNewNode {
	selectCountry=${ccpool[$(($RANDOM % $ccs))]}
	selectContinent=${cnpool[$(($RANDOM % $cns))]}
	selectProxy=${proxy[$(($RANDOM % $proxies))]}
	selectPort=$(($RANDOM+16384))
	#if [[ "$ipInfo" == *"\"continent_code\":\"NA\""* ]] ; then
		#selectContinent=AM
	#elif [[ "$ipInfo" == *"\"continent_code\":\"EU\""* ]] ; then
		#selectContinent=EU
	#fi
	#case $selectContinent in
		#"AM")
			#selectCountry=${nacc[$(($RANDOM % $naccs))]}
			#;;
		#"EU")
			#selectCountry=${eucc[$(($RANDOM % $euccs))]}
			#;;
		#*)
			#echo "No country selected."
			#;;
	#esac
}

while : ; do
	switchNewNode
	case $selectProxy in
		"hola")
			echo "Hola connects to: $selectCountry on ${selectPort}"
			hola --bind-address "127.0.0.1:${selectPort}" --country $selectCountry
			;;
		"opera")
			echo "Opera connects to: $selectContinent on ${selectPort}"
			opera --bind-address "127.0.0.1:${selectPort}" --country $selectContinent
			;;
		*)
			echo "No proxy selected."
            exit 1
			;;
	esac
	sleep 0.2s
done
exit
