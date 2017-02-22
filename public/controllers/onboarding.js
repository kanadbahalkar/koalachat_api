myApp.controller('onboardingController', ['$scope', '$log', '$timeout', '$http', '$window', '$timeout', 'clipboard', function($scope, $log, $timeout, $http, $window, $timeout, clipboard){

    if (!clipboard.supported) {
        console.log('Sorry, copy to clipboard is not supported');
    }

    $scope.verificationBlurb = 'Chief Koala says your website is koalafied to be hooked up with KoalaChat! Copy paste the code below inside the "head" tag of your home page. To complete the setup on your site, we need to verify this Embed Code. After you’re done pasting the code in the HTML of your site, press the “Verify” button below...';

    var timeout;
    
    // Save changes to the copy of the person back to the original,
    // including in the parent array
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
                console.log('FAQ List Updated!');
            }
            else{
                console.log('No Owner-FAQ pair found! :(');
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
  
    //Set Welcome Message
    $scope.setWelcomeMessage = function () {
        $http({
			method: 'POST',
			url: '/api/profile/setwelcomemessage',
			data: $.param({userID: $window.localStorage.userid, newMessage: $scope.welcomeMessage}),
			headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
		})
        .success(function (data, status, headers, config) {
            $window.location.href = '/onboarding/getembedcode';
        })
        .error(function (data, status, headers, config) {
            console.log('Error: Set Welcome Message Failed');
        });
    };

    //Get embed code
    $scope.getEmbedCode = function () {
        $http({
            method: 'POST',
            url: 'api/widget/embedcode',
            data: $.param({userID: $window.localStorage.userid}),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .success(function(response) {
            $scope.embedcode = response.code;
            clipboard.copyText(response.code);
        })
        .error(function (data, status, headers, config) {
            console.log('Error: Get Embed Code Failed');
        });
    };

    //Copy embed code to clipboard 
    $scope.copyEmbedCode = function () {
        clipboard.copyText($scope.embedcode);
        angular.element(document.querySelector('.copy_code')).html('Code Copied to Clipboard');
    }

    //Verify Embed Code
    $scope.verifyEmbedCode = function () {
        $http({
			method: 'POST',
			url: 'api/crawler/verifyembedcode',
			data: $.param({
                ownerID: $window.localStorage.userid, 
                website: $window.localStorage.userwebsite
            }),
			headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
		})
        .success(function (data, status, headers, config) {
            if(data.websiteVerified){
                $window.location.href = '/onboarding/getfaqs';
            }
            else{
                console.log('Embed Code Verification Failed');
            }
        })
        .error(function (data, status, headers, config) {
            console.log('Error:', data.message);
            //Change the text on page to data.message
            $scope.errorText = 'error-text-color';
            $scope.verificationBlurb = data.message
        });
    };

    //Search FAQs on a users website
    $scope.setupFAQPage = function () {
        $http({
			method: 'POST',
			url: 'api/crawler/findfaqsurl',
			data: $.param({
                userID: $window.localStorage.userid, 
                website: $window.localStorage.userwebsite
            }),
			headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
		})
        .success(function (data, status, headers, config) {
            if(data.faqurl){
                $scope.faqurl = data.faqurl;

                //Find FAQs fromt he FAQ URL
                //And populate it on the screen
                $http({
                    method: 'POST',
                    url: 'api/crawler/findfaqs',
                    data: $.param({ 
                        userID: $window.localStorage.userid, 
                        website: $window.localStorage.userwebsite, 
                        faqurl: $scope.faqurl 
                    }),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': $window.localStorage.token
                    }
                })
                .success(function (data, status, headers, config) {
                    if(data.sitedata){
                        //Populate the FAQs in the view
                        $scope.faqlist = data.sitedata.qnaList;
                    }
                    else{
                        console.log('No FAQs found!');
                    }
                })
                .error(function (data, status, headers, config) {
                    console.log('Error: ' + status);
                });

            }
            else{
                console.log('No FAQ URL found on site');
            }
        })
        .error(function (data, status, headers, config) {
            console.log('Error: Setting Up FAQs Page Failed');
        });
    }

    //Search FAQs on a given URL
    $scope.findFAQs = function () {
        if($scope.faqurl){
            $http({
                method: 'POST',
                url: 'api/crawler/findfaqs',
                data: $.param({ 
                    userID: $window.localStorage.userid, 
                    website: $window.localStorage.userwebsite, 
                    faqurl: $scope.faqurl 
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': $window.localStorage.token
                }
            })
            .success(function (data, status, headers, config) {
                if(data.sitedata){
                    //Populate the FAQs in the view
                    $scope.faqlist = data.sitedata.qnaList;
                    $scope.faqlistCopy = data.sitedata.qnaList;
                }
                else{
                    console.log('No FAQs found');
                }
            })
            .error(function (data, status, headers, config) {
                console.log('Error: ' + status);
            });
        }
        else {
            console.log('Hey, your FAQ URL is empty! Copy-paste or Type in your FAQ URL...');
        }
    }

    //TODO: Adding a new FAQ manually

    //Go to dashboard after saving FAQs
    $scope.goHomeYoureDrunk = function () {
        $window.location.href = '/Overview';
    }
}]);