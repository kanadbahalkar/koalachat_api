myApp.controller('profileController', ['$scope', '$location', '$http', '$window','AuthenticationService', 'Facebook','GooglePlus',
                  function($scope, $location, $http, $window, AuthenticationService, Facebook, GooglePlus){

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

    //Allow Anonymous messages
    $scope.allowAnonMessages = true;
    $scope.allowAnonymous = function(){
        console.log($scope.allowAnonMessages);

        $http({
            method: 'POST',
            url: baseUrl + '/profile/allowanonymous',
            data: $.param({
                ownerID : $scope.ownerID,
                allowAnonymous : $scope.allowAnonMessages
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $scope.token
            }
        })
        .success(function(response) {
            console.log('Allow Anon Messages: ', response);
        })
        .error(function(err) {
            console.log(err);
        });
    }

    //Update email preferences
    $scope.emailNotifications = true;
    $scope.subscribe = function(){
        console.log($scope.emailNotifications);

        $http({
            method: 'POST',
            url: baseUrl + '/profile/emailFrequency',
            data: $.param({
                ownerID : $scope.ownerID,
                newsletter: $scope.emailNotifications,
                billingUpdates: $scope.emailNotifications,
                announcements: $scope.emailNotifications
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $scope.token
            }
        })
        .success(function(response) {
            console.log('Updated Email Notifications: ', response);
        })
        .error(function(err) {
            console.log(err);
        });
    }

    // Enable / Diable chatbot on the website
    $scope.enablePlugin = true;
    $scope.togglePlugin = function(){
        console.log($scope.enablePlugin);

        $http({
            method: 'POST',
            url: baseUrl + '/profile/toggleplugin',
            data: $.param({
                ownerID : $scope.ownerID,
                enablePlugin : $scope.enablePlugin
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $scope.token
            }
        })
        .success(function(response) {
            console.log('Enable Plugin: ', response);
        })
        .error(function(err) {
            console.log(err);
        });
    }

    //Update business name

    //Update social profileFields
    function updateSocial(provider) {
      $http({
        method: 'POST',
        url: baseUrl + '/profile/updateownerinfo',
        data: $.param({
          ownerID: $scope.ownerID,
          fieldName: 'socialAccounts',
          provider: provider,
          provider_id: response.id,
          email: response.email,
          name: response.name,
          gender: response.gender
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': $scope.token
        }
      }).success(function(response) {
        console.log('Connected to facebook page');
      }).error(function(err) {
        console.log("Error in conncecting", err);
      });
    }

    //Connect Facebook
    $scope.connectFacebook = function () {
      Facebook.login(function(response) {
        if (response.status == 'connected') {
          $scope.logged = true;
          $scope.facebook();
        }
      });
    }

    $scope.facebook = function() {
      Facebook.api('/me?fields=email,name,id,accounts,photos,website,gender', function(response) {
        var provider = 'facebook';
        updateSocial(provider);
      });
    };

    //Connect Google+
    $scope.connectGooglePlus = function () {
      GooglePlus.login().then(function (authResult) {
          GooglePlus.getUser().then(function (user) {
              var provider = 'facebook';
              updateSocial(provider);
          });
      }, function (err) {
          console.log(err);
      });
    }

    //Connect Twitter

    //Connect Instagram

}]);
