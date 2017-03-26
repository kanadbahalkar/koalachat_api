'use strict';

angular.module('myApp')
    .factory('VisitorsService', ['config', '$http', '$window', function(config, $http, $window){
        var baseUrl = config.baseUrl;

        return {
            //Register a new visitor when they visit a website
            getVisitorsLastWeek: function(data, success, error) {
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
                .then(function(data, response){
                    console.log('Visitors: ', data);
                    response.status(200).send(data);
                });
           },

            //Create a soft lead when a visitor starts a conversation
            //And Create a hard lead when a visitor leaves an email
            // createLead: function(data, success, error) {
            //     $http({
            //         method: 'POST',
            //         url: baseUrl + '/visitor/newvisitor',
            //         data: $.param({
            //             ownerid: data.ownerid,
            //             visitorid: data.visitorid
            //         }),
            //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            //     })
            //     .success(success)
            //     .error(error);
            // },

            //Blacklist a visitor
            // blacklistVisitor: function(success, error) {
            //     $http({
            //         method: 'POST',
            //         url: baseUrl + '/visitor/blacklistvisitor',
            //         data: $.param({
            //             ownerid: data.ownerid,
            //             visitorid: data.visitorid
            //         }),
            //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            //     })
            //     .success(success)
            //     .error(error);
            // },

            //Set nickname of the visitor
            // setVisitorNickname: function(success, error) {
            //     $http({
            //         method: 'POST',
            //         url: baseUrl + '/visitor/setnickname',
            //         data: $.param({
            //             ownerid: data.ownerid,
            //             visitorid: data.visitorid
            //         }),
            //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            //     })
            //     .success(success)
            //     .error(error);
            // },

            //Set email of the visitor
            // setVisitorNickname: function(success, error) {
            //     $http({
            //         method: 'POST',
            //         url: baseUrl + '/visitor/setemail',
            //         data: $.param({
            //             ownerid: data.ownerid,
            //             visitorid: data.visitorid
            //         }),
            //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            //     })
            //     .success(success)
            //     .error(error);
            // },

            //Get list of all visitors
            // getVisitors: function(success, error) {

            //     var filter = req.body.filter;

            //     $http({
            //         method: 'POST',
            //         url: baseUrl + '/visitor/getvisitors/' + filter,
            //         data: $.param({
            //             ownerid: data.ownerid,
            //             visitorid: data.visitorid
            //         }),
            //         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            //     })
            //     .success(success)
            //     .error(error);
            // }

            // Get number of visitors last week

            //Get number of messages sent last week

        };
    }
]);
