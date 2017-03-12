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
    
    //Get number of FAQs
    $scope.faqsCount = 0;
    $http({
        method: 'POST',
        url: 'https://localhost:4731/api/crawler/getfaqscount',
        data: $.param({
            ownerID: $window.localStorage.userid
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': $window.localStorage.token
        }
    })
    .then(function(data){
        $scope.faqsCount = data.data.faqsCount;
    });

    //Add new FAQ
    $scope.addFAQButtonText = "Add a New FAQ";
    $scope.addFAQ = function(){
        if($scope.addFAQButtonText == "Add a New FAQ"){
            $scope.addFAQButtonText = "Save FAQ";
            //Add textareas to type in questions
            $scope.newFAQquestion = '<textarea elastic-textarea class="faq_question" ng-model="newQuestion" placeholder="Write your new FAQ question here..." style="margin-top: 30px;border-bottom: 1px solid #0B61FF;margin-bottom: 30px;height: 30px;"></textarea>';
            $scope.newFAQanswer = '<textarea elastic-textarea class="faq_answer" ng-model="newAnswer" placeholder="Type in the answer to this question..." style="height: 60px;border-bottom: 1px solid #999;"></textarea>';
            angular.element(document.getElementsByClassName('growthhack_blurb')).append($scope.newFAQquestion);
            angular.element(document.getElementsByClassName('growthhack_blurb')).append($scope.newFAQanswer);
        }
        else if($scope.addFAQButtonText == "Save FAQ" && $scope.newFAQquestion != "" && $scope.newFAQanswer != "") {
                
            var newFAQ = {
                question: $scope.newQuestion,
                answer: $scope.newAnswer
            }

            //Save the FAQ in DB
            addNewFAQ(newFAQ);

            //Change button text back to "Add a New FAQ"
            $scope.addFAQButtonText = "Add a New FAQ";

            //Remove added textareas
            angular.element(document.querySelector('.faq_question')).remove();
            angular.element(document.querySelector('.faq_answer')).remove();
        }
    };

    var saveFAQinApiai = function(faq){
        console.log(faq);
        var deferred = $q.defer();
        $http({
            method: 'POST',
            url: 'api/apiai/createintent',
            data: $.param({ 
                ownerID: $window.localStorage.userid, 
                intentQuestion: faq.question, 
                intentAnswer: faq.answer
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .then(function(success){
            deferred.resolve(success.data);
        },function(error){
            $scope.errorText = 'error-text-color';
            $scope.faqBlurb = 'Hmmmm looks like there was an error while saving your FAQs! Can you refresh the page and try again?';
            console.log('Error ', error);
        });
        return deferred.promise;
    };

    //Save added FAQ to the database
    var addNewFAQ = function(newFAQ) {
        $http({
            method: 'POST',
            url: 'api/crawler/addnewfaq',
            data: $.param({
                question: newFAQ.question,
                answer: newFAQ.answer,
                ownerID: $window.localStorage.userid
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .success(function (data, status, headers, config) {
            if(data.data.sitedata && newFAQ.question.length > 0 && newFAQ.answer.length > 0){
                //Populate the FAQs in the view
                console.log('New FAQ Added to your FAQs list! 😊');
                //Update the FAQs count
                $scope.faqsCount = data.data.sitedata[0].qnaList.length;
                //Save the FAQ in APi.ai
                var newFAQ = {
                    ownerID: $window.localStorage.userid,
                    intentQuestion: newFAQ.question,
                    intentAnswer: newFAQ.answer
                }
                saveFAQinApiai(newFAQ);
            }
        })
        .error(function (data, status, headers, config) {
            console.log('Error: ' + status);
        });
    };

    //Get number of current conversations

    //Profanity filter
    
}]);