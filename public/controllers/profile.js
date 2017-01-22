myApp.controller('profileController', ['$scope', '$location', '$http', '$window', function($scope, $location, $http, $window){

    var baseUrl = "https://localhost:4731/api";
    $scope.isActive = function(destination){
        return destination === $location.path();
    }
    
    $scope.token = $window.localStorage.token;
    $scope.userID = $window.localStorage.userid;

    //Get client info
    $http({
        method: 'POST',
        url: baseUrl + '/profile/getownerinfo',
        headers: {
            'Authorization': $scope.token
        }
    })
    .success(function(response) {
        $scope.ownerName = response.owner.profile.firstName + ' ' + response.owner.profile.lastName;
        $scope.businessName = response.owner.businessName;
        $scope.businessWebsite = response.owner.website;
        $scope.accountCreationDate = response.owner.createdAt;
        $scope.userName = response.owner.email;

        console.log(response);
    })
    .error(function(err) {
        console.log(err);
    });
}]);