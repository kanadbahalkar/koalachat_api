angular.module('myApp').directive('receivedMessage', function($compile) {
    return {
        controller: 'messagesController',
        templateUrl : 'partials/receivedMessage.html',
        replace : true,
        link : function(scope, element, attr) {
            scope.$watch(attr.sidebarDirective, function(newVal) {
                
            });
        }
    };
});