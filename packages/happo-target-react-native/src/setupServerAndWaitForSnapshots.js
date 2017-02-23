const express = require('express');
const http = require('http');
const io = require('socket.io');

function buildStoryIterator(socket, stories, onStorySnapshot, onFinished) {
  let i = 0;
  const snapshots = [];

  function next() {
    socket.emit('renderStory', stories[i]);
  }

  function snapshotComplete({ name, uri }) {
    snapshots[i] = { description: name, uri };
    onStorySnapshot(name, uri);
    i += 1;
    if (i === stories.length) {
      onFinished(snapshots);
    } else {
      next();
    }
  }

  socket.on('snapshotComplete', snapshotComplete);

  next();
}

module.exports = function setupServerAndWaitForSnapshots({
  options,
  initializeDriver,
  initializePackager,
}) {
  return new Promise((resolve, reject) => {
    const expressServer = express();
    const httpServer = http.Server(expressServer);
    const ioServer = io(httpServer);

    function onFinished(snapshots) {
      resolve(snapshots);
    }

    function onStorySnapshot(/* name, uri */) {
      // I don't think we need to log anything here...
      // console.log(`Snapshot found: ${name}`);
    }

    ioServer.on('connection', (socket) => {
      socket.on('stories', (stories) => {
        buildStoryIterator(
          socket,
          stories,
          onStorySnapshot,
          onFinished,
        );
      });
    });

    httpServer.listen(options.port, () => {
      console.log(`Happo Target React Native server listening on *:${options.port}`);
      Promise.resolve()
        // launch the user's RN packager process
        .then(initializePackager)
        // once the http server is running, and the packager is running,
        // we can safely launch the app via appium
        .then(initializeDriver)
        // if anything goes wrong here we should bail
        .catch(reject);
    });
  });
};
