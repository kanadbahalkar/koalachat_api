//TODO: 
//1. Display login failure message in chat bubble
//2. Display registration failure message in chat bubble

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
                UserService.user.isLogged = true;
                $window.localStorage.token = res.token;
                $window.location = '/';
            }
        }, function() {
            $rootScope.error = 'Login Failed';
        });
    };

    //FB Login
    window.fbAsyncInit = function() {
        FB.init({
        appId      : '182119938859848',
        xfbml      : true,
        version    : 'v2.8'
        });
        FB.AppEvents.logPageView();
    };

    (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    $scope.fblogin = function() {
        FB.login(function(response) {
            if (response.authResponse) {
                FB.api('/me', 
                {fields: "id, picture, birthday, email, first_name, middle_name, last_name, gender, hometown, link, location, timezone, website, work"}, 
                function(response) {
                //Get response token
                var responseToken = FB.getAuthResponse();
                
                $window.localStorage.fbuser = response;
                // $window.localStorage.token = responseToken;
                UserService.user.isLogged = true;
                $window.localStorage.isLogged = true;
                $window.location = '/';

                //TODO: Create a new user
                //TODO: Save JWT in localStorage
            });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {scope: 'email, user_birthday, pages_show_list', return_scopes: true});
    };

    //Signup a new Owner
    $scope.register = function() {

        var formData = {
            website : $scope.website,
            email : $scope.email,
            password : $scope.password,
            role : 'Owner',
            anonymous : false
        }

        console.log(formData);

        AuthenticationService.register(formData, function(res) {
            if (res.type == false) {
                $log.error(res);
            } else {
                $window.localStorage.token = res.token;
                $window.location = '/';
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