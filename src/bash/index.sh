#!/bin/bash
# Always restart if no failure is detected
QUIT=0
while [ "$QUIT" == "0" ] ; do
	QUIT=1
	echo "Yes!" && QUIT=0
	sleep 1s
done
exit