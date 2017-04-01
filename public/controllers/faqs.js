myApp.controller('faqsController', ['config', '$scope', '$location', '$window', '$http', '$timeout', function(config, $scope, $location, $window, $http, $timeout){

        $scope.addFAQButtonText = "Add a New FAQ";
        $scope.faqlist = [];
        $scope.faqlistCopy = [];

        //Enable scroll on HTML BODY
        angular.element('body').css('overflow-y', 'scroll');

        // Save changes to the copy of the person back to the original,
        // including in the parent array
        var timeout;
        var saveFAQs = function(updatedFAQ) {
                $http({
                        method: 'POST',
                        url: 'api/crawler/updatefaq',
                        data: $.param({
                                questionID: updatedFAQ.questionID,
                                question: updatedFAQ.question,
                                answer: updatedFAQ.answer,
                                ownerID: $window.localStorage.userid
                        }),
                        headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': $window.localStorage.token
                        }
                })
                .success(function (data, status, headers, config) {
                        if(data.sitedata){
                                //Populate the FAQs in the view
                        }
                })
                .error(function (data, status, headers, config) {
                        console.log('Error: ' + status);
                });
        };

        //Add new FAQ
        $scope.addFAQ = function(){
                var newFAQ = {
                        question: '',
                        answer: ''
                }

                if($scope.addFAQButtonText == "Add a New FAQ"){
                        if($scope.faqlist && $scope.faqlist.length > 0)
                                $scope.faqlist.unshift(newFAQ);
                        else
                                $scope.faqlist.push(newFAQ);

                        //Change button text to "Save FAQ"
                        $scope.addFAQButtonText = "Save FAQ";
                }
                else if($scope.addFAQButtonText == "Save FAQ" && $scope.faqlist[0].question != "" && $scope.faqlist[0].answer != "") {

                        newFAQ.question = $scope.faqlist[0].question;
                        newFAQ.answer = $scope.faqlist[0].answer;

                        //Save the FAQ in DB
                        addNewFAQ(newFAQ);

                        //Change button text back to "Add a New FAQ"
                        $scope.addFAQButtonText = "Add a New FAQ";
                }
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
                        if(data.sitedata){
                                //Populate the FAQs in the view
                                console.log('New FAQ Added to your FAQs list! 😊');
                        }
                })
                .error(function (data, status, headers, config) {
                        console.log('Error: ' + status);
                });
        };

        //Delete an FAQ
        $scope.deleteFAQ = function(selectedQuestion){
                $http({
                        method: 'POST',
                        url: 'api/crawler/deletefaq',
                        data: $.param({
                                questionID: selectedQuestion.questionID,
                                ownerID: $window.localStorage.userid
                        }),
                        headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                'Authorization': $window.localStorage.token
                        }
                })
                .success(function (data, status, headers, config) {
                        if(data.sitedata){
                                //Populate the FAQs in the view
                                console.log('This question has been deleted');
                                var index = $scope.faqlist.indexOf(selectedQuestion);
                                $scope.faqlist.splice(index, 1);
                        }
                        else{
                                console.log('No question found! :(');
                        }
                })
                .error(function (data, status, headers, config) {
                        console.log('Error: ' + status);
                });
        };

        // Watch for changes
        $scope.$watch('faqlist', function(newVal, oldVal) {
                if (newVal && oldVal && newVal != oldVal) {
                        for (var val in $scope.faqlist) {
                                if(JSON.stringify(newVal[val]) !== JSON.stringify(oldVal[val])) {
                                        if (timeout) $timeout.cancel(timeout);
                                        timeout = $timeout(saveFAQs(newVal[val]), 3000);
                                }
                        }
                }
        }, true);

        $http({
                method: 'POST',
                url: config.baseUrl + '/crawler/retrievefaqs',
                data: $.param({
                        ownerID: $window.localStorage.userid
                }),
                headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': $window.localStorage.token
                }
        })
        .then(function(data){
                if(data.data.sitedata[0]){
                        //Populate the FAQs in the view
                        $scope.faqlist = data.data.sitedata[0].qnaList;
                        $scope.faqlistCopy = data.data.sitedata[0].qnaList;
                }
                else{
                        $scope.errorText = 'error-text-color';
                        $scope.faqBlurb = 'Derp! We could not find any FAQs from your site! Would you mind putting those in manually? Remember, you can also add more FAQs later... 😊';
                }
        });
}]);
