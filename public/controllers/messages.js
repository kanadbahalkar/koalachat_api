myApp.controller('messagesController', ['$scope', '$location', '$http', '$window', function($scope, $location, $http, $window){

    $scope.messages = [];
    var ownerID = $window.localStorage.userid;
    var selectedVisitorID = null;
    //Connect to server Socket
    var socket = io.connect("https://localhost:4731/");
    
    //1. Get a ping-pong serve from the socket server
    socket.on('serve', function (data) {
        //2. Send OwenrID back in the return
        socket.emit('return', { ownerID: ownerID, owner: true });
    });

    socket.on('sent message', function (data) {
        //1. Create new directive for chatReceived
        $scope.messages = $scope.messages.concat(data);
        $scope.$apply();
    });

    //Load messages of a visitor
    $scope.loadMessages = function(visitor) {
        console.log(visitor);
        selectedVisitorID = visitor.visitorID;
    };

    //Send message to the visitor
    $scope.sendMessage = function() {
        var data = {
            message: $scope.messageText, 
            from: ownerID, 
            to: selectedVisitorID
        }
        socket.emit('send message', data);
        $scope.messages = $scope.messages.concat(data);
        console.log($scope.messages);
    };

    //Get a list of website visitors
    $http({
        method: 'POST',
        url: 'https://localhost:4731/api/visitor/visitorslastweek',
        data: $.param({
            ownerID: $window.localStorage.userid
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': $window.localStorage.token
        }
    })
    .then(function(data){
        $scope.visitors = data.data.visitors;
    });
}]);
