myApp.controller('messagesController', ['$scope', '$location', '$http', '$window', function($scope, $location, $http, $window){

    //Get a list of website visitors
    $http({
        method: 'POST',
        url: 'https://localhost:4731/api/visitor/visitorslastweek',
        data: $.param({
            ownerID: $window.localStorage.userid
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': $window.localStorage.token
        }
    })
    .then(function(data){
        $scope.visitors = data.data.visitors;
    });

    $scope.$watch('searchBox', function updateSearchText(newVal, oldVal) {
        if (newVal !== oldVal) {
            console.log('new Val: ', newVal);
        }
    });
}]);
