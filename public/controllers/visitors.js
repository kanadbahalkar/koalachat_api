myApp.controller('dashboardController', ['$scope', '$log', '$timeout', function($scope, $log, nameService){

    //Set Welcome Message
    $scope.setWelcomeMessage = function () {
        $http({
			method: 'POST',
			url: '/api/visitor/getvisitors/all',
			data: $.param({
                ownerID: $window.localStorage.userid
            }),
			headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
		})
        .success(function (data, status, headers, config) {
            console.log(data);
        })
        .error(function (data, status, headers, config) {
            console.log('Error while finding visitors');
        });
    };
    
}]);