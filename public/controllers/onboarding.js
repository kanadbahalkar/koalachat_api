myApp.controller('onboardingController', ['$scope', '$log', '$timeout', '$http', '$window', '$timeout', 'clipboard', function($scope, $log, $timeout, $http, $window, $timeout, clipboard){

    if (!clipboard.supported) {
        console.log('Sorry, copy to clipboard is not supported');
    }

    $scope.verificationBlurb = 'Chief Koala says your website is koalafied to be hooked up with KoalaChat! Copy paste the code below inside the "head" tag of your home page. To complete the setup on your site, we need to verify this Embed Code. After you’re done pasting the code in the HTML of your site, press the “Verify” button below...';
    $scope.faqBlurb = 'If you have a link for your FAQs, you can simply copy paste it here. If not, you can type in as many FAQs about your website or business below...';
    
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
                $scope.errorText = 'error-text-color';
                $scope.verificationBlurb = 'Oh Shoot! Chief Koala says you Embed Code Verification failed! Try copy pasting the exact same script tag we provided inside the "head" tag of your home page. To complete the setup on your site, we need to verify this Embed Code. After you’re done pasting it, press the “Verify” button... ';
                $scope.errorText = '';
            }
        })
        .error(function (data, status, headers, config) {
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
                        $scope.errorText = 'error-text-color';
                        $scope.faqBlurb = 'Sadness! We could not find any FAQs on your site! Would you mind putting those in manually? Remember, you can also add FAQs in your account later... :)';
                    }
                })
                .error(function (data, status, headers, config) {
                    $scope.errorText = 'error-text-color';
                    $scope.faqBlurb = data.message
                });

            }
            else{
                $scope.errorText = 'error-text-color';
                $scope.faqBlurb = 'Derp! We could not find an FAQs Link on your site! Could you copy paste your link FAQs Link manully? Remember, you can also add FAQs in your account later... :)';
            }
        })
        .error(function (data, status, headers, config) {
            $scope.errorText = 'error-text-color';
            $scope.faqBlurb = data.message
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
                if(data.sitedata[0]){
                    //Populate the FAQs in the view
                    $scope.faqlist = data.sitedata[0].qnaList;
                    $scope.faqlistCopy = data.sitedata[0].qnaList;
                }
                else if(data.sitedata && !data.sitedata[0]){
                    //Populate the FAQs in the view
                    $scope.faqlist = data.sitedata.qnaList;
                    $scope.faqlistCopy = data.sitedata.qnaList;
                }
                else{
                    $scope.errorText = 'error-text-color';
                    $scope.faqBlurb = 'Sadness! We could not find any FAQs on your site! Would you mind putting those in manually? Remember, you can also add FAQs in your account later... :)';
                }
            })
            .error(function (data, status, headers, config) {
                $scope.errorText = 'error-text-color';
                $scope.faqBlurb = data.message
            });
        }
        else {
            $scope.errorText = 'error-text-color';
            $scope.faqBlurb = 'Oh hey, your FAQ URL is empty! Copy-paste or Type in your FAQ URL, or type it in manually. Remember, you can also add FAQs in your account later... :)';
        }
    }

    //TODO: Adding a new FAQ manually

    //Go to dashboard after saving FAQs
    $scope.goHomeYoureDrunk = function () {
        $window.location.href = '/Overview';
    }
}]);