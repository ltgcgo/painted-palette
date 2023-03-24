@echo off
title Painted Palette Web UI
move /Y patched.js deno.js
cls
.\deno.exe run --allow-net --allow-env --allow-read --allow-write deno.js batch
exit
