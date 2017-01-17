# Happo Target: React Native

## Installation

If you haven't already installed `happo` you will need to do that:
```bash
npm install --save-dev happo
```

To get the React Native target, you will install from npm:

```bash
npm install --save-dev happo-target-react-native
```

This guide is assuming you also have the relevant emulators or simulators installed
on your machine that you would normally need in order to develop on the corresponding
platform.


## Defining examples

Happo expects you to have a `happo.js` entry file at the root that your packager is 
running.

The entry file should import the client library and define "Stories"

```jsx
import StoryManager from 'happo-target-react-native/client';

import React from 'react';
import FancyButton from './path/to/components/FancyButton';

StoryManager.make('some example', () => (
  <FancyButton>
    Example Button!
  </FancyButton>
));
```


### Example configuration

```js
// .happo.js
// =========

var ReactNativeTarget = require('happo-target-react-native');

module.exports = {
  // ... 

  targets: [
    // ...
    new ReactNativeTarget({
      // an overridable name to identify the target 
      // (useful for running a specific target from the CLI.)
      // (default: 'react-native')
      name: 'iphone-6',

      // One of `['ios','android']`. Determines which platform you want to test.
      platform: 'ios',

      // the os version of the emulator you'd like to run
      platformVersion: '9.3',

      // the name of the emulator you'd like to run
      deviceName: 'iPhone 6',

      // the orientation you'd like the emulator to be in. One of 'portrait' or 'landscape'.
      // (default shown below)
      deviceOrientation: 'portrait',

      // Control the port used for the local websockets server (default shown below)
      port: 5000,

      // The bash command/path that gets executed to run the packager. This can
      // be customized if you have a custom packager commend you want happo to use
      // instead. (default shown below)
      packagerCommand: 'node',

      // the list of args to be passed to the packager (default shown below)
      packagerArgs: [
        require.resolve('react-native/local-cli/cli'),
        'start',
      ],

      // The working directory the packager command should be executed in.
      // (default shown below)
      packagerCwd: process.cwd(),

      // the environment variables to use in the appium process
      // (default shown below)
      packagerEnv: process.env,

      // appium command timeout, in milliseconds
      // (default shown below)
      newCommandTimeout: 1000 * 60 * 5,

      // the working directory for appium to be executed from
      // (default shown below)
      appiumCwd: process.cwd(),

      // the environment variables to use in the appium process
      // (default shown below)
      appiumEnv: process.env,

      // the hostname for the appium process
      // (default shown below)
      appiumServerHost: 'localhost',

      // the port for the appium server
      // (default shown below)
      appiumServerPort: 4734,

    }),
  ],
};
```
