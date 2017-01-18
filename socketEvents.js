exports = module.exports = (io) => {

  var connectedUsers = {};

  // Set socket.io listeners.
  io.sockets.on('connection', (socket) => {
    
    var vid = null;
    
    //Test Event
    socket.emit('newConnection', { hello: 'world' });
    
    // Subscribe a new Visitor with an Owner
    socket.on('subscribe to owner', function (visitor) {
        socket.join(visitor.oid);
        connectedUsers[visitor.vid] = socket;
        console.log('New user connected: ' + visitor.vid + ' to Owner: ' + visitor.oid);
        vid = visitor.vid;
    });

    //Visitor sends a messge to the Owner
    socket.on('message from visitor', function (data) {
      console.log('Message from Visitor: ', data);
      
      //Respond with an echo of the same message
      //connectedUsers[data.vid].emit('reply from owner', data.message);
      socket.emit('message from owner', { message: data.message });
    });

    //Owner sends messge to a Visitor
    socket.on('message from owner', function (message) {
      console.log('Message from Owner: ', message);
    });

    // Disconnect a Visitor
    socket.on('disconnect', function (oid) {
      socket.leave(oid);
    });
  });
}