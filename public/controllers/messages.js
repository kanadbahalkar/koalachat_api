<<<<<<< HEAD
myApp.controller('messagesController', ['$scope', '$location', 'VisitorsService', function($scope, $location, VisitorsService){
    
    $scope.visitorsLastWeek = VisitorsService.getVisitorsLastWeek();
    console.log($scope.visitorsLastWeek);

}]);
=======
myApp.controller('messagesController', ['$scope', '$location', function($scope, $location){
  $scope.names = [
    {
      'name':'Rachel Curtis',
      'name_details': 'Nothing'
    },
    {
      'name': 'John Wayne',
      'name_details': 'Nothing'
    },
    {
      'name':'Joshua Weildman',
      'name_details':'Nothing'
    },
    {
      'name':'Joshua Weildman',
      'name_details':'Nothing'
    },
    {
      'name':'Shaun Chindhi',
      'name_details':'Nothing'
    }
  ]

  $scope.$watch('searchBox', function updateSearchText(newVal, oldVal) {
    if (newVal !== oldVal) {
      console.log('new Val: ', newVal);

    }
  });
}]);
>>>>>>> 67dcbff438532155d4da2e699652daa7b3d17ee2
