// TODO
//1. Owner can set Lead's nickname
//2. Show if lead is hot, warm or cold next to Score
//3. Delete and Blacklist confirmation buttons
//4. Button to redirect to Messages page so Owner can see a lead's messages

myApp.controller('contactsController', ['config', '$scope', '$http', '$window', '$timeout', function(config, $scope, $http, $window, $timeout){

    var baseUrl = config.baseUrl;

    //Get number of unique visitors last week
    $scope.loadLeads = function(leadsFilter){
        $scope.leadsFilter = leadsFilter;
        $http({
            method: 'POST',
            url: baseUrl + '/visitor/getvisitors/' + leadsFilter,
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
    }

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
