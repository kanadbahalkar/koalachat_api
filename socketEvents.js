//////USE CASES//////
//1. A new Owner signs up
//2. Owner is online and joins the socket
//3. Owner is offline
//4. A new anonymous visitor joins the socket chat
//5. Anon visitor leaves the socket chat
//6. Anon visitor gives out their email
//7. Anon visitor connects to an owner
//8. Anon visitor sends a message to the owner
//9. Owner sends a message to a visitor
//10. Owner sends an announcement to all visitors
//11. Anon visitor goes offline
//12. Anon visitor comes online again



var request = require('request');

request.defaults({
    strictSSL: false, // allow us to use our self-signed cert for testing
    rejectUnauthorized: false
});

exports = module.exports = function (io) {
  
  //Create array of live sockets
  var sockets = {};

  // Set socket.io listeners.
  io.sockets.on('connection', function (socket) {
    
    //1. Emit a starter event when a new connection (Owner or Visitor) occurs 
    socket.emit('serve', 'New Connection!');

    //2. On receiving a reply from the connection, check who is connected (owner or visitor)
    socket.on('return', function (data) {
        
        //3. Create list of open sockets
        //TODO: USE NAMESPACES AND ROOMS FOR THIS LATER

        //4. If the visitor is new, Register the visitor
        if(data.visitorID) {
          sockets[data.visitorID] = socket;
          //Save a new user
          if(data.newVisitor){
            var requestData = { 'visitorID' : data.visitorID, 'ownerID' : data.ownerID };
            request({
              url: 'https://localhost:4731/api/visitor/newvisitor',
              method: "POST",
              json: requestData,
              headers: {'content-type' : 'application/x-www-form-urlencoded'},
            }, function(error, response, body){
              if(error) console.log('ERROR: ', error);
            });
          }
        }
        else {
          sockets[data.ownerID] = socket;
        }

        console.log(data);
        console.log(Object.keys(sockets));
    });

    socket.on('send message', function (data) {
      console.log(data);
      if(data.to && sockets[data.to]){
        sockets[data.to].emit('sent message', data);
      }
    });

    // Disconnect a Visitor
    socket.on('disconnect', function (oid) {
      socket.leave(oid);
    });
  });
}