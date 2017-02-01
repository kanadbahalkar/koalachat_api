myApp.controller('topnavController', ['$scope', '$location', '$window', '$http',  function($scope, $location, $window, $http){

    $scope.ownername = $window.localStorage.ownerName || 'Anon Koala'; 
    $scope.profilepic = $window.localStorage.profilepic || '/assets/images/avatar.png'; 

}]);