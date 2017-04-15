myApp.controller('profileController', ['$scope', '$location', '$http', '$window','AuthenticationService', 'Facebook','GooglePlus', 'config', function($scope, $location, $http, $window, AuthenticationService, Facebook, GooglePlus, config){

    var baseUrl = config.baseUrl;
    var socket = io.connect(config.socketUrl);

    $scope.token = $window.localStorage.token;
    $scope.ownerID = $window.localStorage.userid;
    $scope.allowAnonMessages = false;
    $scope.emailNotifications = true;
    $scope.enablePlugin = true;

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
        $window.localStorage.ownername = $scope.ownerName;
        $scope.businessName = response.owner.businessName;
        $scope.businessWebsite = response.owner.website;
        $scope.accountCreationDate = response.owner.createdAt;
        $scope.userEmail = response.owner.email;
        $scope.profilepic = response.owner.profile.photo || '/assets/images/avatar.png';
        $window.localStorage.profilepic = $scope.profilepic;
        $scope.allowAnonMessages = response.owner.allowAnonymous || false;
        if(response.owner.socialAccounts){
            $scope.fbConnected = response.owner.socialAccounts.filter(function(item) {
                return item.provider === 'facebook';
            });
            $scope.googlePlusConnected = response.owner.socialAccounts.filter(function(item) {
                return item.provider === 'google';
            });

            if ($scope.fbConnected.length == 1) { $scope.fb = 'Connected'; }
            else { $scope.fb = ''; }

            if ($scope.googlePlusConnected.length == 1) { $scope.gp = 'Connected'; }
            else { $scope.gp = ''; }
        }

        //Profile completion
        $scope.profileCompletion = 0;
        if($scope.businessName) $scope.profileCompletion += 20;
        if($scope.businessWebsite) $scope.profileCompletion += 20;
        if($scope.fbConnected) $scope.profileCompletion += 20;
        if($scope.googlePlusConnected) $scope.profileCompletion += 20;
        if($scope.ownerName) $scope.profileCompletion += 20;
    })
    .error(function(err) {
        console.log(err);
    });

    //Update user profile on text change
    $scope.updateProfile = function (fieldname){
        
        console.log(fieldname);

        var fieldvalue;
        if(fieldname == 'password')
            fieldvalue = $scope.updatedPassword;
        if(fieldname == 'businessName')
            fieldvalue = $scope.businessName;
        if(fieldname == 'ownerName')
            fieldvalue = $scope.ownerName;

        $http({
            method: 'POST',
            url: baseUrl + '/profile/updateownerinfo',
            data: $.param({
                ownerID : $scope.ownerID,
                fieldname : fieldname,
                fieldvalue : fieldvalue
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': $scope.token
            }
        })
        .success(function(response) {
            console.log('Profile Updated!');
        })
        .error(function(err) {
            console.log(err);
        });
    }

    //Allow Anonymous messages
    $scope.allowAnonymous = function(){
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
            socket.emit('allow anon', { ownerID: $scope.ownerID, allowAnon: response.allowAnonymous });
        })
        .error(function(err) {
            console.log(err);
        });
    }

    //Update email preferences
    $scope.subscribe = function(){
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
    $scope.togglePlugin = function(){
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
    function updateSocial(provider, response) {
        var managedPages = '';
        var managedPagesCount = 0;
        if(provider === 'facebook'){
            managedPages = JSON.stringify(response.accounts.data);
            managedPagesCount = response.accounts.data.length;

            $http({
                method: 'POST',
                url: baseUrl + '/profile/updatesocial',
                data: $.param({
                    ownerID: $scope.ownerID,
                    fieldName: 'socialAccounts',
                    provider: provider,
                    provider_id: response.id,
                    email: response.email,
                    name: response.name,
                    gender: response.gender,
                    photo: response.picture.data.url,
                    managedPages: managedPages,
                    managedPagesCount: managedPagesCount
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
        else if(provider === 'google'){
            $http({
                method: 'POST',
                url: baseUrl + '/profile/updatesocial',
                data: $.param({
                    ownerID: $scope.ownerID,
                    fieldName: 'socialAccounts',
                    provider: provider,
                    provider_id: response.id,
                    email: response.email,
                    name: response.name,
                    gender: response.gender,
                    photo: response.picture
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
      Facebook.api('/me?fields=email,name,id,accounts,website,gender,picture.type(large)', function(response) {
        var provider = 'facebook';
        updateSocial(provider, response);
      });
    };

    //Connect Google+
    $scope.connectGooglePlus = function () {
      GooglePlus.login().then(function (response) {
          GooglePlus.getUser().then(function (user) {
              var provider = 'google';
              updateSocial(provider, user);
          });
      }, function (err) {
          console.log(err);
      });
    }

    //Connect Twitter

    //Connect Instagram
    
}]);
