angular.module('myApp').service('SocketService', ["$rootScope", function ($rootScope) {

    var socket = io.connect("https://localhost:4731/");
    socket.on('serve', function (data) {
        if (typeof(Storage) !== "undefined") {
            if(localStorage.getItem('userid')) {
                socket.emit('return', { ownerID: localStorage.getItem('userid'), owner: true });
            }
        } else {
            console.log('No Web Storage support! :`(');
        }
    });

    return {
        getSocket: function() {
            return socket;
        }
    };
    
}]);