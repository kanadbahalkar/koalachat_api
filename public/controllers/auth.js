'use strict';

myApp.controller('authController', ['$route', '$routeParams', '$rootScope', '$scope', '$location', '$window', '$ocLazyLoad', '$http', 'UserService', 'AuthenticationService', 
    function($route, $routeParams, $rootScope, $scope, $location, $window, $ocLazyLoad, $http, UserService, AuthenticationService){

    //Lazy load the pluin UI
    $ocLazyLoad.load(['jqueryUI', 'pluginUI'], {cache: true, serie: true});

    //Hook up Auth API
    //Login
    $scope.login = function() {
        
        var formData = {
            email: $scope.email,
            password: $scope.password
        }
        
        AuthenticationService.login(formData, function(res) {
            if (res.type == false) {
                $log.error(res);
            } else {
                UserService.setIsLogged(true);
                $window.localStorage.token = res.token;
                $window.localStorage.userfullname = res.user.profile.firstName + ' ' + res.user.profile.lastName;
                $window.localStorage.userid = res.user._id;
                $window.localStorage.useremail = res.user.email;
                $window.location = '/Overview';
            }
        }, function() {
            $rootScope.error = 'Login Failed';
        });
    };

    $scope.fblogin = function() {
        AuthenticationService.fblogin(function(res) {
            if (res.type == false) {
                $log.error(res);
            } else {
                UserService.setIsLogged(true);
                $window.localStorage.token = res.token;
                $window.localStorage.user = res.user;
                $window.localStorage.userid = res.user._id;
                $window.localStorage.useremail = res.user.email;
                $window.location = '/Overview';
            }
        }, function() {
            $rootScope.error = 'Login Failed';
        });
    };

    //Signup a new Owner
    $scope.register = function(website, email, password) {

        var formData = {
            website : website,
            email : email,
            password : password,
            role : 'Owner',
            anonymous : false
        }

        AuthenticationService.register(formData, function(res) {
            if (res.type == false) {
                $log.error(res);
            } else {
                UserService.setIsLogged(true);
                $window.localStorage.token = res.token;
                $window.localStorage.user = res.user;
                $window.localStorage.userid = res.user._id;
                $window.localStorage.useremail = res.user.email;
                $window.localStorage.userwebsite = res.user.website;
                $window.location = '/onboarding/setwelcome';
            }
        }, function() {
            $rootScope.error = 'Signup Failed';
        })
    };

    $scope.me = function() {
        AuthenticationService.me(function(res) {
            $scope.myDetails = res;
        }, function() {
            $rootScope.error = 'Failed to fetch details';
        })
    };

    $scope.logout = function() {
        AuthenticationService.logout(function() {
            $window.location = '/login'
        }, function() {
            $log.error('Logout Failed!');
        });
    };
    $scope.token = $window.localStorage.token;
}]);
