#!/usr/bin/env bash

echo "Building HappoRunner.app"
# this command runs xcbuild which stdouts like megabytes of data, so we want to redirect stdout
# to /dev/null but keep stderr
node ./node_modules/react-native/local-cli/cli.js run-ios --project-path ./runner/ios --packager=false &> /dev/null

echo "Building HappoRunner.app (done)"
