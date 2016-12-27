angular.module('app')
    .factory('chatService', [ '$rootScope', '$http', function($rootScope, $http) {
        
        //dummy messages
        var list = $http.get('assets/js/apps/email/emails.json').then(function(response) {
            return response.data.emails;
        });

        var socket = io.connect();
        return {
            on: function(eventName, callback){
                socket.on(eventName, callback);
            },
            emit: function(eventName, data) {
                socket.emit(eventName, data);
            },
            all: function() {
                return list;
            },
            find: function(id) {
                return list.then(function(list) {
                    for (var i = 0; i < list.length; i++) {
                        for (var j = 0; j < list[i].list.length; j++) {
                            if (list[i].list[j].id == id)
                                return list[i].list[j];
                        }
                    }
                })
            }
        };
    }]);