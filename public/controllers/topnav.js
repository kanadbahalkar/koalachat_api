myApp.controller('topnavController', ['$scope', '$location', function($scope, $location){

    $scope.isActive = function(destination){
        return destination === $location.path();
    }
    
}]);