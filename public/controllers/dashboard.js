myApp.controller('dashboardController', ['$scope', '$log', '$timeout', function($scope, $log, nameService){

    $scope.people = [
        {
            name : 'John',
            address : '1137 Comm Ave',
            city : 'Allston',
            state : 'MA',
            zip : '02134'
        },
        {
            name : 'Jane',
            address : '1137 Comm Ave',
            city : 'Allston',
            state : 'MA',
            zip : '02134'
        },
        {
            name : 'Jake',
            address : '1137 Comm Ave',
            city : 'Allston',
            state : 'MA',
            zip : '02134'
        }
    ];

    $scope.formattedAddressFunction = function(person){
        return person.address + ' ' + person.city + ' ' + person.state + ' ' + person.zip
    };
    
}]);