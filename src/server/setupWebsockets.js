function buildStoryIterator(socket, stories, onStorySnapshot, onFinished) {
  let i = 0;
  const snapshots = [];

  function next() {
    socket.emit('renderStory', stories[i]);
  }

  function snapshotComplete({ name, uri }) {
    snapshots[i] = { description: name, tmpFile: uri };
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

module.exports = function setupWebsockets(onStorySnapshot, onFinished) {
  const app = require('express')();
  const http = require('http').Server(app);
  const io = require('socket.io')(http);

  io.on('connection', function(socket) {
    socket.on('stories', function(stories) {
      buildStoryIterator(
        socket,
        stories,
        onStorySnapshot,
        onFinished
      );
    });
  });

  return new Promise(resolve => {
    http.listen(5000, function() {
      console.log('listening on *:5000');
      resolve();
    });
  });
};
