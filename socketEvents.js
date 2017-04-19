////// TODO //////
//1. Change Visitor status to Offline when they disconnect √
//2. Change it back to Live when they reconnect √
//3. Add a timestamp to the message sent by Visitor
//4. Remove the duplicate visitor error √
//5. Make plugin iframe clickthru / or atleast dynamic height √
//6. Stop sending error codes when the server is down or restarting
//7. Save the conversation in the local storage of Visitor to be retieved later on
//8. USE NAMESPACES AND ROOMS FOR ROUTING TRAFFIC

var request = require('request');
var https = require("https");
var url = require('url');
var config = require('./config/main');

request.defaults({
	strictSSL: false, // allow us to use our self-signed cert for testing
	rejectUnauthorized: false
});

exports = module.exports = function (io) {

	//Create array of live sockets
	var sockets = {};

	// Set socket.io listeners.
	io.on('connection', function (socket) {

		var socketID;
		var userCategory;

		//Send Business Name
		socket.on('get business preferences', function(ownerID){
			request({
				url: config.api_server + 'api/profile/getbusinessprefs',
				method: "POST",
				json: { ownerID: ownerID },
				headers: { 'content-type': 'application/x-www-form-urlencoded' }
			}, function (error, response, body) {
				if (error) console.log('ERROR: ', error);
				if (body.businessName) {
					socket.emit('business name', body.businessName);
					socket.emit('allow anonymous', body.allowAnonymous);
					socket.emit('enable disable', body.enablePlugin);
				}
			});
		});
		
		//1. Emit a starter event when a new connection (Owner or Visitor) occurs
		socket.emit('serve', 'New Connection!');

		//2. On receiving a reply from the connection, check who is connected (owner or visitor)
		socket.on('return', function (data) {

			//Save a new user
			if (data.visitor && data.newVisitor) {

				socketID = data.visitorID;
				userCategory = 'visitor';

				var requestData = { 'ownerID': data.ownerID };
				request({
					url: config.api_server + 'api/visitor/newvisitor',
					method: "POST",
					json: requestData,
					headers: { 'content-type': 'application/x-www-form-urlencoded' }
				}, function (error, response, body) {
					if (error) console.log('ERROR: ', error);
					if (body.visitor) {
						var vid = body.visitor._id;
						//Create a new conversation when a new visitor is registered
						request({
							url: config.api_server + 'api/chat/newconversation',
							method: "POST",
							json: { 'ownerID': body.visitor.ownerID, 'visitorID': vid, 'message': 'New visitor joined!', 'sender': body.visitor.ownerID },
							headers: { 'content-type': 'application/x-www-form-urlencoded' }
						}, function (error, response, body) {
							if (error) console.log('ERROR: ', error);
							socket.emit('new visitor', body.conversation.participants[1], body.conversation._id);
							socket.emit('new visitor for admin', body.conversation.participants[1]);

							sockets[body.conversation.participants[1]] = {
								socket: socket,
								owner: body.conversation.participants[0],
								visitor: body.conversation.participants[1]
							};
							sockets[body.conversation.participants[0]] = {
								socket: socket,
								owner: body.conversation.participants[1],
								visitor: body.conversation.participants[0]
							};
						});
					}
				});
			}
			else if (data.visitor) {

				socketID = data.visitorID;
				userCategory = 'visitor';

				console.log('Visitor connected: ', data);
				//Update visitor attributes
				var requestData = { 'vid': data.visitorID };
				request({
					url: config.api_server + 'api/visitor/updatevisitor',
					method: "POST",
					json: requestData,
					headers: { 'content-type': 'application/x-www-form-urlencoded' }
				}, function (error, response, body) {
					if (error) console.log('ERROR: ', error);
					if (body.visitor) {
						sockets[body.visitor._id] = {
							socket: socket,
							owner: data.ownerID,
							visitor: data.visitorID
						};
					}
				});
			}
			else if (data.owner) {

				socketID = data.ownerID;
				userCategory = 'owner';

				console.log('Owner connected: ', data);
				sockets[data.ownerID] = {
					socket: socket,
					owner: data.ownerID
				};
			}
		});

		socket.on('send message', function (data) {
			//Get response from api.ai if the sender is visitor
			if (data.sender == 'visitor' && data.email == false && data.to != '58d08da84409aa91be05190c') {
				request({
					method: 'POST',
					url: config.api_server + 'api/apiai/sendmessagetoapiai',
					headers: { 'content-type': 'application/x-www-form-urlencoded' },
					form: {
						question: data.message,
						sessionId: data.from,
						ownerID: data.to
					}
				}, function (error, response, body) {
					if (error) throw new Error(error);
					//Send a reply
					console.log('Sent Message: ', data);

					var replyBody = JSON.parse(body);

					var replyFromApiai = {
						message: replyBody.reply,
						sender: 'owner',
						from: data.to,
						to: data.from,
						conversation: data.conversation,
						channel: 'Website'
					};
					console.log('Reply from API.ai: ', replyFromApiai);
					sockets[data.from].socket.emit('sent message', replyFromApiai);
					if (sockets[data.to])
						sockets[data.to].socket.emit('sent message', replyFromApiai);

					if (replyBody.action == 'input.unknown') {
						sockets[data.from].socket.emit('ask for email', true);
					}
				});
			}
			else if (data.sender == 'visitor' && data.email == true) {
				sockets[data.from].socket.emit('sent message', { message: 'Thanks! Someone from our team will drop you an email as soon as possible. 😊' });
				sockets[data.to].socket.emit('sent message', { message: 'Thanks! Someone from our team will drop you an email as soon as possible. 😊' });
				//mark visitor as a lead
				request({
					method: 'POST',
					url: config.api_server + 'api/visitor/setemail',
					headers: { 'content-type': 'application/x-www-form-urlencoded' },
					form: {
						ownerID: data.to,
						vid: data.from,
						email: data.message
					}
				}, function (err, resp, body) {
					if (err) throw new Error(error);
				});
			}
			else if( data.to == '58d08da84409aa91be05190c'){
				//save message
				request({
					url: config.api_server + 'api/chat/reply',
					method: "POST",
					json: { 'conversationID': data.conversation, 'message': data.message, 'sender': data.from, 'channel': data.channel },
					headers: { 'content-type': 'application/x-www-form-urlencoded' }
				}, function (error, response, body) {
					console.log('Saved Message from Owner to Admin: ', data);
					if (error) console.log('ERROR: ', error);
				});
			}

			//TODO: gives error when visitor id is in socket
			if (sockets[data.to])
				sockets[data.to].socket.emit('sent message', data);

			//Save ther message in database
			if(!data.sender){
				request({
					url: config.api_server + 'api/chat/reply',
					method: "POST",
					json: { 'conversationID': data.conversation, 'message': data.message, 'sender': data.from, 'channel': data.channel },
					headers: { 'content-type': 'application/x-www-form-urlencoded' }
				}, function (error, response, body) {
					if (error) console.log('ERROR: ', error);
				});
			}
		});

		// Disconnect a Visitor
		socket.on('disconnect', function () {
			if (userCategory == 'visitor') {
				var requestData = { 'visitorID': socketID, 'live': false };
				request({
					url: config.api_server + 'api/visitor/updatevisitorstatus',
					method: "POST",
					json: requestData,
					headers: { 'content-type': 'application/x-www-form-urlencoded' }
				}, function (error, response, body) {
					if (error) console.log('ERROR: ', error);
				});
			}

			delete sockets.disconnectedSocket;
		});
	});
}
