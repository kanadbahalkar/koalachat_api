myApp.controller('topnavController', ['$scope', '$location', '$window', '$http', 'AuthenticationService', function($scope, $location, $window, $http, AuthenticationService){

    $scope.ownername = $window.localStorage.ownername || 'Anon Koala'; 
    $scope.profilepic = $window.localStorage.profilepic || '/assets/images/avatar.png'; 

    $scope.isActive = function (viewLocation) {
        var active = ($location.path().startsWith(viewLocation));
        return active;
    };

    $scope.logout =  function () {
        AuthenticationService.logout();
        $window.location.href = '/login';
    }

    var everywhere = angular.element(window.document);
    everywhere.bind('click', function(event){
        if($scope.isDropdownOpen == true && event.target.className.indexOf('down-arrow') == -1 && event.target.className.indexOf('navbar-brand name') == -1) {
            $scope.isDropdownOpen = false;
        }
        $scope.$apply();
    });
}]);