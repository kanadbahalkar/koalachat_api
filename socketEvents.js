////// TODO //////
//1. Change Visitor status to Offline when they disconnect
//2. Change it back to Live when they reconnect
//3. Add a timestamp to the message sent by Visitor
//4. Remove the duplicate visitor error
//5. Make plugin iframe clickthru / or atleast dynamic height
//6. Stop sending error codes when the server is down or restarting
//7. Save the conversation in the local storage of Visitor to be retieved later on
//8. USE NAMESPACES AND ROOMS FOR ROUTING TRAFFIC

var request = require('request');
var qs = require("querystring");
var https = require("https");

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
        //Save a new user
        if(data.visitor && data.newVisitor){
          
          var requestData = { 'ownerID' : data.ownerID };
          request({
            url: 'https://localhost:4731/api/visitor/newvisitor',
            method: "POST",
            json: requestData,
            headers: {'content-type' : 'application/x-www-form-urlencoded'}
          }, function(error, response, body){
            if(error) console.log('ERROR: ', error);
            if(body.visitor) {
              socket.emit('new visitor', body.visitor._id);
              socket.emit('new visitor for admin', body.visitor);
              sockets[body.visitor._id] = socket;
              sockets[data.ownerID] = socket;
            }
          });
        }
        else if(data.visitor) {
          console.log('Visitor connected: ', data);
          sockets[data.visitorID] = socket;
        }
        else if(data.owner) {
          console.log('Owner connected: ', data);
          sockets[data.ownerID] = socket;
        }
    });

    socket.on('send message', function (data) {
      console.log(data);
      if(data.to && sockets[data.to]){
        sockets[data.to].emit('sent message', data);
      }

      //Get response from api.ai if the sender is visitor
      if(data.sender == 'visitor' && data.email == false){
        request({
          method: 'POST',
          url: 'https://localhost:4731/api/apiai/sendmessagetoapiai',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          form: {
            question: data.message,
            sessionId: data.from,
            ownerID: data.to 
          }
        }, function (error, response, body) {   
          if (error) throw new Error(error);
          //Send a reply
          var replyBody = JSON.parse(body);
          var replyFromApiai = { message: replyBody.reply };
          sockets[data.from].emit('sent message', replyFromApiai);

          if(replyBody.action == 'input.unknown'){
            sockets[data.from].emit('ask for email', true);
          }
        });
      }
      else if(data.sender == 'visitor' && data.email == true){
        sockets[data.from].emit('sent message', { message: 'Thanks! Someone from our team will drop you an email as soon as possible. 😊' });
      }
    });

    socket.on('validate', function (data) {
      console.log(data);
      //Emit Valdation Message
    });

    // Disconnect a Visitor
    socket.on('disconnect', function (oid) {
      socket.leave(oid);
    });

    socket.on('allow anon', function (data) {
      // For all the visitors sockets, send a message to update the jquery to show email
      // sockets[data.ownerID].emit('allow anon', data.allowAnon);
    });
  });
}