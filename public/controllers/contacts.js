myApp.controller('contactsController', ['$scope', '$http', '$window', '$timeout', function($scope, $http, $window, $timeout){

    var baseUrl = "https://localhost:4731/api";

    //Get number of unique visitors last week
    $http({
        method: 'POST',
        url: baseUrl + '/visitor/getvisitors/all',
        data: $.param({
            ownerID: $window.localStorage.userid
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': $window.localStorage.token
        }
    })
    .then(function (response) {
        $scope.leads = response.data.visitors;
    });

    //Delete a Lead
    $scope.deleteLead = function(selectedLead){
        $http({
            method: 'POST',
            url: 'api/visitor/archivevisitor',
            data: $.param({
                vid: selectedLead._id
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $window.localStorage.token
            }
        })
        .success(function (data, status, headers, config) {
            if(data.visitor){
                var index = $scope.leads.indexOf(selectedLead);
                $scope.leads.splice(index, 1);
            }
            else{
                console.log('No lead found! :(');
            }
        })
        .error(function (data, status, headers, config) {
            console.log('Error: ' + status);
        });
    };
}]);
