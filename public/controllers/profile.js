myApp.controller('profileController', ['$scope', '$location', '$http', '$window', function($scope, $location, $http, $window){

    var baseUrl = "https://localhost:4731/api";
    $scope.isActive = function(destination){
        return destination === $location.path();
    }
    
    $scope.token = $window.localStorage.token;
    $scope.ownerID = $window.localStorage.userid;
    
    //Get client info
    $http({
        method: 'POST',
        url: baseUrl + '/profile/getownerinfo',
        data: $.param({
           ownerID : $scope.ownerID
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': $scope.token
        }
    })
    .success(function(response) {
        $scope.ownerName = response.owner.profile.firstName + ' ' + response.owner.profile.lastName;
        $scope.businessName = response.owner.businessName;
        $scope.businessWebsite = response.owner.website;
        $scope.accountCreationDate = response.owner.createdAt;
        $scope.userName = response.owner.email;
        $scope.profilepic = response.owner.profile.profilepic || '/assets/images/avatar.png'; 
    })
    .error(function(err) {
        console.log(err);
    });

    //update Password
    $scope.changePassword = function (){

        $http({
            method: 'POST',
            url: baseUrl + '/profile/updateownerinfo',
            data: $.param({
                ownerID : $scope.ownerID,
                fieldname : 'password',
                fieldvalue : $scope.updatedPassword
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $scope.token
            }
        })
        .success(function(response) {
            console.log('Password Updated: ', response);
            $window.location.href = '/Profile';
        })
        .error(function(err) {
            console.log(err);
        });
    }

    //Update business name

    //Update email preferences

    //Connect Facebook

    //Connect Twitter

    //Connect Instagram

    //Connect Google+

}]);