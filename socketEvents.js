exports = module.exports = (io) => {

  // Set socket.io listeners.
  io.sockets.on('connection', (socket) => {
    
    var connectedVisitors = {};
    connectCounter = 0;
    conversationsCounter = 0;
    var vid = null;
    
    //New Visitor Connected Event
    var vid = Math.random().toString(36).substring(3,16)+ +new Date;
    socket.emit('newConnection', { vid: vid });
    
    // Subscribe a new Visitor with an Owner
    socket.on('subscribe to owner', function (visitor) {
        socket.join(visitor.oid);
        connectedVisitors[visitor.vid] = socket;
        console.log('New visitor connected: ' + visitor.vid + ' to Owner: ' + visitor.oid);
        connectCounter++;
        console.log('Total number of visitors: ' + connectCounter);
        vid = visitor.vid;
    });

    //Visitor sends a messge to the Owner
    socket.on('message from visitor', function (data) {
      console.log(conversationsCounter);
      console.log('Message from Visitor: ', data);
      
      //Get the number of conversations (When a visitor sends a message himself)
      if(data.firstMessage)
        conversationsCounter++;

      //Respond with an echo of the same message
      // connectedVisitors[data.vid].emit('reply from owner', { message: data.message });
    });

    // Disconnect a Visitor
    socket.on('disconnect', function (oid) {
      socket.leave(oid);
      connectCounter--;
      conversationsCounter--;
    });
  });
}