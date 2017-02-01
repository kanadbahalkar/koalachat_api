'use strict';

myApp.controller('dashboardController', ['$http', '$scope', '$log', '$window', 'VisitorsService', function($http, $scope, $log, $window, VisitorsService){

    //Get number of current visitors on the site
    var baseUrl = "https://localhost:4731/api";
    var socket = io.connect("https://localhost:4731");

    //Get number of live visitors
    socket.on('testing', function (data) {
        console.log(data);
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
            $scope.visitorsLastWeek = response.data.count;
            return response;
        });
    }
    
    //Get number of current conversations

    //Blacklist a visitor

    //Profanity filter
    
}]);