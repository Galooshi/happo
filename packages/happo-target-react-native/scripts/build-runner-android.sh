#!/usr/bin/env bash

echo "Building app-debug.apk"
node ./node_modules/react-native/local-cli/cli.js run-android --root ./runner

echo "Building app-debug.apk (done)"
