#!/usr/bin/env bash

echo "Building HappoRunner.apk"
node ./node_modules/react-native/local-cli/cli.js run-android --root ./runner

echo "Building HappoRunner.apk (done)"
