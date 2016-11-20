exports = module.exports = (io) => {
  
  var userIsConnected = true;
  var users = [];
  var users_connected = [];
  var sockets = {};

  // Set socket.io listeners.
  io.on('connection', (socket) => {
    
    var uid = null;
    
    socket.on('set oid', function (oid) {
      sockets[oid] = socket;
    });

    // register the new user
    socket.on('register', function (visitor) {
      if ( users_connected.indexOf(visitor.tempSessionId) < 0 ) {
        users_connected.push(visitor);
      }

      if ( users.indexOf(visitor.tempSessionId) < 0 ) {
        console.log('New user connected: ' + visitor.tempSessionId + ' to Owner: ' + visitor.oid);
        users.push(visitor.tempSessionId);
      }

      uid = visitor.tempSessionId;
    });

    // clean up when a user leaves, and broadcast it to other users
    socket.on('disconnect', function () {
      users_connected.splice( users_connected.indexOf(uid), 1);
      
      setTimeout(function () {
        if ( users_connected.indexOf(uid) < 0 ) {
          var index = users.indexOf(uid);
          users.splice(index, 1);
        }
      }, 3000);
    });

    socket.on('enter conversation', (conversation) => {
      socket.join(conversation);
      console.log('joined ' + conversation);
    });

    socket.on('leave conversation', (conversation) => {
      socket.leave(conversation);
      console.log('left ' + conversation);
    })

    //Receive Message
    socket.on('send message', function (data) {
      sockets[data.oid].emit('bot replies', data.message);
    });

    socket.on('new message', (conversation) => {
      io.sockets.in(conversation).emit('refresh messages', conversation);
    });
  });
}