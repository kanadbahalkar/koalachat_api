myApp.controller('onboardingController', ['$scope', '$log', '$timeout', '$http', '$window', 'clipboard', function($scope, $log, $timeout, $http, $window, clipboard){

    if (!clipboard.supported) {
        console.log('Sorry, copy to clipboard is not supported');
    }

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
			data: $.param({userID: $window.localStorage.userid, website: $window.localStorage.userwebsite}),
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
            console.log('Error: Embed Code Verification Failed');
        });
    };

    //TODO:
    //Search FAQs on a users website
    //Search FAQs on a given URL
    //Adding a new FAQ manually
}]);