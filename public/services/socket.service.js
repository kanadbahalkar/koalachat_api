angular.module('myApp').service('SocketService', ["config", "$rootScope", function (config, $rootScope) {

    var socket = io.connect(config.socketUrl, { secure: true }); 
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
