myApp.controller('contactController', ['$scope', '$log', '$timeout', function($scope, $log){

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
    console.log(response.data);
    $scope.contacts = response.data;
  });

}]);
