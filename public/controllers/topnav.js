myApp.controller('topnavController', ['$scope', '$location', '$window', '$http',  function($scope, $location, $window, $http){

    $scope.ownername = $window.localStorage.ownername || 'Anon Koala'; 
    $scope.profilepic = $window.localStorage.profilepic || '/assets/images/avatar.png'; 

    $scope.isActive = function (viewLocation) {
        var active = ($location.path().startsWith(viewLocation));
        return active;
    };
}]);