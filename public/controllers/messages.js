myApp.controller('messagesController', ['$scope', '$location', '$http', '$window', function($scope, $location, $http, $window){

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
        console.log($scope.visitors);
    });

    // $scope.names = [
    //     {
    //     'name':'Rachel Curtis',
    //     'name_details': 'Nothing'
    //     },
    //     {
    //     'name': 'John Wayne',
    //     'name_details': 'Nothing'
    //     },
    //     {
    //     'name':'Joshua Weildman',
    //     'name_details':'Nothing'
    //     },
    //     {
    //     'name':'Joshua Weildman',
    //     'name_details':'Nothing'
    //     },
    //     {
    //     'name':'Shaun Chindhi',
    //     'name_details':'Nothing'
    //     }
    // ]

    $scope.$watch('searchBox', function updateSearchText(newVal, oldVal) {
        if (newVal !== oldVal) {
            console.log('new Val: ', newVal);
        }
    });
}]);
