#!/usr/bin/env bash

echo "Building HappoRunner.exe"
node ./node_modules/react-native/local-cli/cli.js run-windows --root ./runner

echo "Building HappoRunner.exe (done)"
