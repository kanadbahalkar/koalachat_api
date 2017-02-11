myApp.controller('messagesController', ['$scope', '$location', '$http', '$window', '$filter', function($scope, $location, $http, $window, $filter){

    $scope.messages = [];
    var ownerID = $window.localStorage.userid;
    $scope.selectedVisitorID = null;
    $scope.selectedVisitorTempID = null;
    $scope.selectedConversationID = null;
    $scope.selectedConversationStartDate = null;

    //1. Connect to server Socket
    var socket = io.connect("https://localhost:4731/");
    
    //2. Get a ping-pong serve from the socket server
    socket.on('serve', function (data) {
        //3. Send OwenrID back in the return
        socket.emit('return', { ownerID: ownerID, owner: true });
    });

    socket.on('sent message', function (data) {
        //Create new directive for chatReceived
        $scope.messages = $scope.messages.concat(data);
        $scope.$apply();
    });
    
    //3. Get a list of website visitors
    $http({
        method: 'POST',
        url: 'https://localhost:4731/api/visitor/visitorslastweek',
        data: $.param({
            ownerID: ownerID
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': $window.localStorage.token
        }
    })
    .then(function(data){
        $scope.visitors = data.data.visitors;
        if($scope.visitors.length > 0) {
             $scope.selectedVisitorID = data.data.visitors[0]._id;
             $scope.loadMessages(data.data.visitors[0]);
        }
    });

    //5. Get conversations between owner and visitor
    $scope.loadMessages = function(visitor) {

        $scope.selectedVisitorID = visitor._id;
        $scope.selectedVisitorTempID = visitor.visitorID;
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
                        if(message){
                            var data = {
                                message: message.body, 
                                from: ownerID, 
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

    //Send message to the visitor
    $scope.sendMessage = function() {
        //Save the message in DB
        if($scope.selectedConversationID) {
            
            var data = {
                message: $scope.messageText, 
                from: ownerID, 
                to: $scope.selectedVisitorTempID, 
                createdAt: Date.now(),
                conversationId: $scope.selectedConversationID
            }
            socket.emit('send message', data);
            $scope.messages = $scope.messages.concat(data);

            // $scope.messages = $filter('orderBy')($scope.messages, 'createdAt');
            //Send replies in this conversation
            $http({
                method: 'POST',
                url: 'https://localhost:4731/api/chat/reply/' + $scope.selectedConversationID,
                data: $.param({
                    ownerID: ownerID,
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
            .then(function(data){
                $scope.selectedConversationID = data.data.conversationId;
                    var data = {
                    message: $scope.messageText, 
                    from: ownerID, 
                    to: $scope.selectedVisitorID,
                    createdAt: Date.now(),
                    conversationId: $scope.selectedConversationID
                }
                socket.emit('send message', data);
                $scope.messages = $scope.messages.concat(data);
                //Reset the message textarea
                $scope.messageText = null;
            });
        }
    };
}]);
