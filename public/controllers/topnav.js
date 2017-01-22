myApp.controller('topnavController', ['$scope', '$location', '$window', function($scope, $location, $window){

    $scope.isActive = function(destination){
        return destination === $location.path();
    }
    
    $scope.ownerName = $window.localStorage.userfullname;

}]);