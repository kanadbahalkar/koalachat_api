'use strict';

angular.module('myApp').factory('UserService', function () {
var user = {
    isLogged: false,
    username: '',       
};

var reset = function() {
    user.isLogged = false;
    user.username = '';
};

return {
    user: user,
    reset : reset
  };
});