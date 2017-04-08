'use strict';

myApp.controller('authController', ['config', '$route', '$routeParams', '$rootScope', '$scope', '$location', '$window', '$ocLazyLoad', '$http', 'UserService', 'AuthenticationService',
    function(config, $route, $routeParams, $rootScope, $scope, $location, $window, $ocLazyLoad, $http, UserService, AuthenticationService){

    var baseUrl = config.baseUrl;

    //Lazy load the pluin UI
    $ocLazyLoad.load(['jqueryUI', 'pluginUI'], {cache: true, serie: true});

    //Check if the user is already logged in
    if($window.localStorage.token && $window.localStorage.userid && $window.localStorage.useremail){

        //Get number of unique visitors last week
        $http({
            method: 'POST',
            url: baseUrl + '/auth/checklogin',
            data: $.param({
                id: $window.localStorage.userid,
                email: $window.localStorage.useremail
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .then(function (response) {
            //Check if returned user is the same as the one in localStorage
            if( $window.localStorage.userid == response.data.user._id &&
                $window.localStorage.useremail == response.data.user.email){
                //Redirect the user to the Dashboard
                $window.location = '/Overview';
            }
        });
    }

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
                $window.localStorage.user = res.user;
                $window.localStorage.userid = res.user._id;
                $window.localStorage.useremail = res.user.email;
                $window.localStorage.userwebsite = res.user.website;
                $window.location = '/Overview';
            }
        }, function() {
            jQuery('.chat_login_alert').remove();
            var validationText = 'Hmmm seems like your email and password are not matching...🤔 <br>Try logging in again pweez.';
            jQuery('.chat_login').prepend('<div class="chat_login_alert">' + validationText +  '</div>');
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
                $window.localStorage.userfullname = res.user.profile.firstName + ' ' + res.user.profile.lastName;
                $window.localStorage.user = res.user;
                $window.localStorage.userid = res.user._id;
                $window.localStorage.useremail = res.user.email;
                $window.localStorage.userwebsite = res.user.website;
                $window.location = '/onboarding/getbusinessname';
            }
        }, function() {
            jQuery('.chat_login_alert').remove();
            var validationText = 'Shoot! There was an error while registering your account! 😮<br>Try signing up again pweez.';
            jQuery('.chat_login').prepend('<div class="chat_login_alert">' + validationText +  '</div>');
        })
    };

    $scope.logout = function() {
        AuthenticationService.logout(function() {
            $window.localStorage.removeItem(token);
            $window.localStorage.removeItem(user);
            $window.localStorage.removeItem(userid);
            $window.localStorage.removeItem(useremail);
            $window.localStorage.removeItem(userwebsite);
            $window.localStorage.removeItem(userfullname);
            $window.location = '/login'
        }, function() {
            $log.error('Logout Failed!');
        });
    };

    $scope.token = $window.localStorage.token;
}]);
