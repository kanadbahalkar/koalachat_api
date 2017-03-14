// TODO
//1. Owner can set Lead's nickname
//2. Show if lead is hot, warm or cold next to Score
//3. Owner can Blacklist or Block a lead 
//4. Button to redirect to Messages page so Owner can see a lead's messages 
//5. Delete and Blacklist confirmation buttons

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
    $scope.deleteOrBlacklistLead = function(selectedLead, action){
        $http({
            method: 'POST',
            url: 'api/visitor/' + action,
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
