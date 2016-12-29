'use strict';

myApp.service('UserService', function() {
  this.userData = {
        isLogged: false,
        username: '',       
    };

  this.user = function() {
        return this.userData;
  };

  this.setIsLogged = function(value) {
        this.userData.isLogged = value;
  };

  this.getIsLogged = function() {
        return this.userData.isLogged;
  };

  this.setUsername = function(uname) {
        this.userData.username = uname;
  };

  this.getUsername = function() {
        return this.userData.username;
  };
});