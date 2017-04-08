'use strict';

angular.module('myApp')
    .factory('AuthenticationService', ['config', '$http', '$window', function(config, $http, $window){
        var baseUrl = config.baseUrl;

        function changeUser(user) {
            angular.extend(currentUser, user);
        }

        function urlBase64Decode(str) {
            var output = str.replace('-', '+').replace('_', '/');
            switch (output.length % 4) {
                case 0:
                    break;
                case 2:
                    output += '==';
                    break;
                case 3:
                    output += '=';
                    break;
                default:
                    throw 'Illegal base64url string!';
            }
            return window.atob(output);
        }

        function getUserFromToken() {
            var token = $window.localStorage.token;
            var user = {};
            console.log("token :"+token);
            if (token != 'undefined' && token != undefined) {
                var encoded = token.split('.')[1];
                user = JSON.parse(urlBase64Decode(encoded));
            }
            return user;
        }

        var currentUser = getUserFromToken();

        return {
            register: function(data, success, error) {
                $http({
                    method: 'POST',
                    url: baseUrl + '/auth/registerowner',
                    data: $.param({website: data.website, email: data.email, password: data.password}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .success(success)
                .error(error);
            },
            login: function(data, success, error) {
                console.log(baseUrl + '/auth/login');
                $http({
                    method: 'POST',
                    url: baseUrl + '/auth/login',
                    data: $.param({email: data.email, password: data.password}),
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                })
                .success(success)
                .error(error);
            },
            me: function(success, error) {
                $http.get(baseUrl + '/me').success(success).error(error);
            },
            logout: function(success) {
                changeUser({});
                delete $window.localStorage.token;
                $window.loca
            }
        };
    }
]);
