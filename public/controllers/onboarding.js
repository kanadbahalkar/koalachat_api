myApp.controller('onboardingController', ['$scope', '$log', '$timeout', function($scope, $log, nameService){

    $scope.people = [
        {
            name : 'John',
            address : '1137 Comm Ave',
            city : 'Allston',
            state : 'MA',
            zip : '02134'
        },
        {
            name : 'Jane',
            address : '1137 Comm Ave',
            city : 'Allston',
            state : 'MA',
            zip : '02134'
        },
        {
            name : 'Jake',
            address : '1137 Comm Ave',
            city : 'Allston',
            state : 'MA',
            zip : '02134'
        }
    ];

    $scope.formattedAddressFunction = function(person){
        return person.address + ' ' + person.city + ' ' + person.state + ' ' + person.zip
    };
    
    $scope.setWelcomeMessage = function () {
        $http({
			method: 'POST',
			url: apiUrl+'/onboarding/setwelcome',
			data: $.param($scope.welcomeMessage),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
        .success(function (data, status, headers, config) {
            if(data.token){
                $window.location.href = '/onboarding/addsocial';
            }
            else{
                console.log('Set Welcome Message Failed');
            }
        })
        .error(function (data, status, headers, config) {
            console.log('Error: Set Welcome Message Failed');
        });
    };

    $scope.setSocialAccounts = function () {
        
    };

    $scope.setSitePlatform = function () {
        $http({
			method: 'POST',
			url: apiUrl+'/onboarding/setplatform',
			data: $.param($scope.platform),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
        .success(function (data, status, headers, config) {
            if(data.token){
                $window.location.href = '/onboarding/getembedcode';
            }
            else{
                console.log('Set Platform Failed');
            }
        })
        .error(function (data, status, headers, config) {
            console.log('Error: Set Platform Failed');
        });
    };

    //Get embed code
    $scope.getEmbedCode = function () {
        $http({
            method: 'GET',
            url: apiUrl + '/onboarding/getembedcode',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-access-token': '*'
            }
        })
        .success(function(response) {
            console.log('Get Embed Code Failed');
        })
        .error(function (data, status, headers, config) {
            console.log('Error: Get Embed Code Failed');
        });
    };

    //Verify Embed Code
    $scope.verifyEmbedCode = function () {
        $http({
			method: 'POST',
			url: apiUrl+'/onboarding/verifyembedcode',
			data: $.param($scope.platform),
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		})
        .success(function (data, status, headers, config) {
            if(data.token){
                $window.location.href = '/onboarding/getembedcode';
            }
            else{
                console.log('Embed Code Verification Failed');
            }
        })
        .error(function (data, status, headers, config) {
            console.log('Error: Embed Code Verification Failed');
        });
    };

    //API for searching FAQs
    //API for adding a new FAQ manually
}]);