@echo off
title Painted Palette Web UI
:loop
	if exist patched.js (
		move /Y patched.js deno.js
		echo Updated successfully.
	)
	.\deno.exe run --allow-net --allow-env --allow-read --allow-write deno.js batch
	timeout /t 5 /nobreak > NUL
goto loop
exit
