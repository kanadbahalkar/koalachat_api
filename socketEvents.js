var request = require('request');
request.defaults({
    strictSSL: false, // allow us to use our self-signed cert for testing
    rejectUnauthorized: false
});

function findRooms(rooms) {
  var availableRooms = [];
  if (rooms) {
      for (var room in rooms) {
          if (!rooms[room].hasOwnProperty(room)) {
              availableRooms.push(room);
          }
      }
  }
  return availableRooms;
}

exports = module.exports = (io) => {

  // Set socket.io listeners.
  io.sockets.on('connection', (socket) => {
    
    var connectedVisitors = {};
    var vid = null;
    
    //New Visitor Connected Event
    var vid = Math.random().toString(36).substring(3,16)+ +new Date;
    socket.emit('newConnection', { vid: vid });

    // Register a new Visitor with an Owner
    socket.on('subscribe to owner', function (visitor) {
        socket.join(visitor.oid);
        connectedVisitors[visitor.vid] = socket;
        console.log('New visitor connected: ' + visitor.vid + ' to Owner: ' + visitor.oid);
        
        connectedVisitors[visitor.vid].emit('testing', 'HEY after new subscriber...' );

        vid = visitor.vid;
        
        var requestData = { 'visitorID' : visitor.vid, 'ownerID' : visitor.oid };

        request({
          url: 'https://localhost:4731/api/visitor/newvisitor',
          method: "POST",
          json: requestData,
          headers: {'content-type' : 'application/x-www-form-urlencoded'},
        }, function(error, response, body){
          if(error) console.log('ERROR: ', error);
        });
    });

    //Visitor sends a messge to the Owner
    socket.on('message from visitor', function (data) {
      console.log('Message from Visitor: ', data);
      //Respond with an echo of the same message
      connectedVisitors[data.vid].emit('reply from owner', { message: data.message });
    });

    // Disconnect a Visitor
    socket.on('disconnect', function (oid) {
      socket.leave(oid);
    });
  });
}