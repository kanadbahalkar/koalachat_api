<<<<<<< HEAD
myApp.controller('messagesController', ['$scope', '$location', 'VisitorsService', function($scope, $location, VisitorsService){
    
    $scope.visitorsLastWeek = VisitorsService.getVisitorsLastWeek();
    console.log($scope.visitorsLastWeek);

}]);
=======
myApp.controller('messagesController', ['$scope', '$location', function($scope, $location){
  console.log("Inside messages controller");

  
}]);
>>>>>>> 67dcbff438532155d4da2e699652daa7b3d17ee2
