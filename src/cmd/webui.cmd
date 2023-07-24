@echo off
title Painted Palette Web UI
:loop
	if exist patched.js (
		move /Y patched.js node.js
		echo Updated successfully.
	)
	.\node.exe node.js batch
	timeout /t 2 /nobreak > NUL
goto loop
exit
