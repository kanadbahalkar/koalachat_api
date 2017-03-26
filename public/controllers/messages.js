myApp.controller('messagesController', ['$scope', '$location', '$http', '$window', '$filter', '$timeout', 'SocketService', function($scope, $location, $http, $window, $filter, $timeout, SocketService){

    $scope.messages = [];
    var ownerID = $window.localStorage.userid;
    $scope.ownerID = ownerID;
    $scope.selectedVisitorID = null;
    $scope.selectedConversationID = null;
    $scope.selectedConversationStartDate = null;

    var socket = SocketService.getSocket();

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
                url: 'https://localhost:4731/api/chat/getconversations/',
                data: $.param({
                    ownerID: $window.localStorage.userid
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': $window.localStorage.token
                }
            })
            .then(function(response){
                var lastConversation = response.data.conversations[response.data.conversations.length - 1]
                $scope.selectedConversationID = lastConversation.conversationID;
                data.conversationID = $scope.selectedConversationID
                $scope.sendMessage(data);
            });
        }
        else {
            data.conversationID = $scope.selectedConversationID;
            data.from = $window.localStorage.userid;
            data.to = $scope.selectedVisitorID; 
            data.channel = 'Website';
            $scope.sendMessage(data);
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
            $scope.visitors = data.data.visitors;
            if($scope.visitors && $scope.visitors.length > 0) {
                $scope.selectedConversationStartDate = $scope.visitors[0].visitedAt;
                $scope.selectedVisitorID = $scope.visitors[0]._id;
                $scope.loadMessagesAndVisitorProfile($scope.visitors[0]);
            }
        });
    }

    //5. Get conversations between owner and visitor
    $scope.loadMessagesAndVisitorProfile = function(visitor) {

        $scope.selectedVisitor = visitor;
        $scope.selectedVisitorID = visitor._id;
        $scope.messages = [];
        
        $http({
            method: 'POST',
            url: 'https://localhost:4731/api/chat/getconversations/',
            data: $.param({
                ownerID: ownerID
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .then(function(data){
            data.data.conversations.forEach(function(conversation, index, conversations){
                $scope.selectedConversationStartDate = conversation.date;
                if(conversation) {
                    conversation.messages.forEach(function(message, index, messages){
                        var sender = (message.sender && message.sender._id == ownerID) ? ownerID : 'visitorID'
                        
                        if(message && message.body != 'New visitor joined!'){
                            var data = {
                                message: message.body, 
                                from: sender, 
                                to: $scope.selectedVisitorID,
                                createdAt: message.createdAt,
                                conversationID: message.conversation
                            }
                            
                            $scope.messages = $scope.messages.concat(data);
                            $scope.messages = $filter('orderBy')($scope.messages, 'createdAt');
                        }
                    });
                }
            });
        });
    };

    //Get earliest conversationID
    $scope.setConversationID = function(message) { 
        $scope.selectedConversationID = message.conversationID;
    }

    $scope.getMessageBody = function(){
        if($scope.messageText != undefined && !$scope.messageText.trim() == ""){
            var data = {
                message: $scope.messageText, 
                from: ownerID,
                to: $scope.selectedVisitorID, 
                conversation: $scope.selectedConversationID,
                channel: 'Website'
            }

            socket.emit('send message', data);
            $scope.messages = $scope.messages.concat(data);
            $scope.messageText = null;
            //$scope.sendMessage(data);
        }
    }

    //Send message to the visitor
    $scope.sendMessage = function(data) {
        //Save the message in DB
        if($scope.selectedConversationID) {
            $scope.messages = $scope.messages.concat(data);
            $scope.messageText = data.message;

            //Send replies in this conversation
            $http({
                method: 'POST',
                url: 'https://localhost:4731/api/chat/reply/',
                data: $.param({
                    conversationID: $scope.selectedConversationID,
                    message: $scope.messageText,
                    sender: data.from,
                    channel: 'Website'
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
    };

    //Save Visitor Profdile edits
    var saveProfileUpdates = function(newVal, oldVal) {
        if (newVal != oldVal) {
            $timeout(function() {
                $http({
                    method: 'POST',
                    url: 'https://localhost:4731/api/visitor/updatevisitorprofile',
                    data: $.param({
                        visitorID: $scope.selectedVisitorID,
                        updatedName: $scope.selectedVisitor.name,
                        updatedNickname: $scope.selectedVisitor.nickname,
                        updatedPhone: $scope.selectedVisitor.phone,
                        updatedEmail: $scope.selectedVisitor.email,
                        updatedGender: $scope.selectedVisitor.gender
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': $window.localStorage.token
                    }
                });
            }, 3000);
        }
    };

    //Delete a Visitor
    $scope.deleteOrBlacklistVisitor = function(selectedVisitor, action){
        $http({
            method: 'POST',
            url: 'api/visitor/' + action,
            data: $.param({
                vid: selectedVisitor._id
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .success(function (data, status, headers, config) {
            if(data.visitor){
                var index = $scope.visitors.indexOf(selectedVisitor);
                $scope.visitors.splice(index, 1);
            }
            else{
                console.log('No visitor found! :(');
            }
        })
        .error(function (data, status, headers, config) {
            console.log('Error: ' + status);
        });
    };

    $scope.$watch('selectedVisitor.name', saveProfileUpdates)
    $scope.$watch('selectedVisitor.nickname', saveProfileUpdates)
    $scope.$watch('selectedVisitor.email', saveProfileUpdates)
    $scope.$watch('selectedVisitor.phone', saveProfileUpdates)
    $scope.$watch('selectedVisitor.gender', saveProfileUpdates)
}]);
