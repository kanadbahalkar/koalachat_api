'use strict';

myApp.controller('dashboardController', ['$http', '$scope', '$log', '$window', '$routeParams', 'VisitorsService', 'UserService', function($http, $scope, $log, $window, $routeParams, VisitorsService, UserService){

    //Get number of current visitors on the site
    var baseUrl = "https://localhost:4731/api";
    var socket = io.connect("https://localhost:4731/");

    var access_token = $routeParams.access_token;
    var userid = $routeParams.id;
    if(access_token){
        UserService.setIsLogged(true);
        $window.localStorage.token = access_token;
        $window.localStorage.userid = userid;
        $window.location = '/Overview';
    }

    //1. Get a ping-pong serve from the socket server
    socket.on('serve', function (data) {
        //2. Send OwenrID back in the return
        socket.emit('return', { userID: $window.localStorage.userid, owner: true });
    });

    //Get number of unique visitors last week
    $scope.initDashboard = function() {
        
        //Get number of unique visitors last week
        $http({
            method: 'POST',
            url: baseUrl + '/visitor/visitorslastweek',
            data: $.param({
                ownerID: $window.localStorage.userid
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .then(function (response) {
            $scope.visitorsLastWeekCount = response.data.visitorsLastWeek;
        });

        //Get number of live visitors
        $http({
            method: 'POST',
            url: baseUrl + '/visitor/livevisitorscount',
            data: $.param({
                ownerID: $window.localStorage.userid
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .then(function (response) {
            $scope.liveVisitorsCount = response.data.liveVisitors;
        });
    }
    
    //Get number of current conversations

    //Profanity filter
    
}]);