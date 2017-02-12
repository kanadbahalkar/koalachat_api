myApp.controller('messagesController', ['$scope', '$location', '$http', '$window', '$filter', function($scope, $location, $http, $window, $filter){

    $scope.messages = [];
    var ownerID = $window.localStorage.userid;
    $scope.ownerID = ownerID;
    $scope.selectedVisitorID = null;
    $scope.selectedConversationID = null;
    $scope.selectedConversationStartDate = null;

    //1. Connect to server Socket
    var socket = io.connect("https://localhost:4731/");
    
    //2. Get a ping-pong serve from the socket server
    socket.on('serve', function (data) {
        //3. Send OwenrID back in the return
        socket.emit('return', { ownerID: ownerID, owner: true });
    });

    //Update the visitors list when a new visitor joins in
    socket.on('new visitor for admin', function (data) {
        console.log(data);
        $scope.visitors = $scope.visitors.concat(data);
    });

    socket.on('sent message', function (data) {
        //Save the message in DB
        if($scope.selectedConversationID == null){
            $http({
                method: 'POST',
                url: 'https://localhost:4731/api/chat/conversations/' + data.from,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': $window.localStorage.token
                }
            })
            .then(function(response){
                var lastConversation = response.data.conversations[response.data.conversations.length - 1]
                $scope.selectedConversationID = lastConversation[0].conversationId;
                data.conversationId = $scope.selectedConversationID
                $scope.sendMessage(data, data.from);
            });
        }
        else {
            data.conversationId = $scope.selectedConversationID
            $scope.sendMessage(data, data.from);
        }
    });
    
    //3. Get a list of website visitors
    $scope.loadVisitors = function() {
        $http({
            method: 'POST',
            url: 'https://localhost:4731/api/visitor/getvisitors/all',
            data: $.param({
                ownerID: ownerID
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .then(function(data){
            $scope.visitors = data.data.visitor;
            if($scope.visitor && $scope.visitor.length > 0) {
                $scope.selectedConversationStartDate = data.data.visitor[0].visitedAt;
                $scope.selectedVisitorID = data.data.visitor[0]._id;
                $scope.loadMessages(data.data.visitor[0]);
            }
        });
    }

    //5. Get conversations between owner and visitor
    $scope.loadMessages = function(visitor) {

        $scope.selectedVisitorID = visitor._id;
        $scope.messages = [];
        
        $http({
            method: 'POST',
            url: 'https://localhost:4731/api/chat/conversations/' + $scope.selectedVisitorID,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .then(function(data){
            data.data.conversations.forEach(function(conversation, index, conversations){
                if(conversation[0] && conversation[0].body == 'NewVisitor') {
                    //Print timestamp
                    $scope.selectedConversationStartDate = conversation[0].createdAt;
                }
                else if(conversation) {
                    conversation.forEach(function(message, index, messages){
                        var sender = (message.sender && message.sender._id == ownerID) ? ownerID : 'visitorID'
                        
                        if(message){
                            var data = {
                                message: message.body, 
                                from: sender, 
                                to: $scope.selectedVisitorID,
                                createdAt: message.createdAt,
                                conversationId: message.conversationId
                            }
                            
                            $scope.messages = $scope.messages.concat(data);
                            $scope.messages = $filter('orderBy')($scope.messages, 'createdAt');
                        }
                    });
                }
            });
        });
    };

    //Get earliest conversationId
    $scope.setConversationID = function(message) { 
        $scope.selectedConversationID = message.conversationId;
    }

    $scope.getMessageBody = function(){
        
        if($scope.messageText != undefined && !$scope.messageText.trim() == ""){
            var data = {
                message: $scope.messageText, 
                from: ownerID,
                to: $scope.selectedVisitorID, 
                createdAt: Date.now(),
                conversationId: $scope.selectedConversationID
            }

            socket.emit('send message', data);
            $scope.sendMessage(data, ownerID);
        }
    }

    //Send message to the visitor
    $scope.sendMessage = function(data, sender) {

        //Save the message in DB
        if($scope.selectedConversationID) {
            $scope.messages = $scope.messages.concat(data);
            $scope.messageText = data.message;

            // $scope.messages = $filter('orderBy')($scope.messages, 'createdAt');
            //Send replies in this conversation
            $http({
                method: 'POST',
                url: 'https://localhost:4731/api/chat/reply/' + $scope.selectedConversationID,
                data: $.param({
                    sender: sender,
                    message: $scope.messageText
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': $window.localStorage.token
                }
            })
            .then(function(data){
                //Reset the message textarea
                $scope.messageText = null;
            });
        }
        else {
            //Create a new conversation
            $http({
                method: 'POST',
                url: 'https://localhost:4731/api/chat/new/' + $scope.selectedVisitorID,
                data: $.param({
                    ownerID: ownerID,
                    message: $scope.messageText
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': $window.localStorage.token
                }
            })
            .then(function(response){
                $scope.selectedConversationID = response.data.conversationId;
                if(data.conversationId == null) data.conversationId = $scope.selectedConversationID;
                socket.emit('send message', data);
                $scope.messages = $scope.messages.concat(data);
                //Reset the message textarea
                $scope.messageText = null;
            });
        }
    };
}]);
