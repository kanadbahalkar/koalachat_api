myApp.controller('messagesController', ['$scope', '$location', 'VisitorsService', function($scope, $location, VisitorsService){
    
    $scope.visitorsLastWeek = VisitorsService.getVisitorsLastWeek();
    console.log($scope.visitorsLastWeek);

}]);