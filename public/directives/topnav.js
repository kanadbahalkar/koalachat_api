angular.module('myApp').directive('topnav', function() {
    return {
        templateUrl : 'partials/topnav.html',
        replace : true,
        link : function(scope, element, attr) {
            scope.$watch(attr.sidebarDirective, function(newVal) {
                
            });
        }
    };
});