myApp.controller('topnavController', ['$scope', '$location', '$window', function($scope, $location, $window){

    $scope.isActive = function(destination){
        return destination === $location.path();
    }
    
    $scope.ownerID = $window.localStorage.userid;

}]);