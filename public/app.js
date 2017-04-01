var myApp = angular.module('myApp', ['ngMessages', 'ngResource', 'ngRoute', 'oc.lazyLoad', 'angular-clipboard', 'ngAnimate', 'facebook', 'googleplus', 'angularMoment', 'n3-line-chart', '720kb.tooltips']);

myApp.constant('config', {
//   baseUrl:'https://localhost:4731/api',
//   socketUrl:'https://localhost:4731/'
  baseUrl: 'https://ec2-54-186-217-17.us-west-2.compute.amazonaws.com:4731/api/',
  socketUrl: 'https://ec2-54-186-217-17.us-west-2.compute.amazonaws.com:4731/'
});

myApp.config(function ($routeProvider, $locationProvider, $ocLazyLoadProvider, FacebookProvider, GooglePlusProvider){

    $ocLazyLoadProvider.config({
        modules: [
            {
                name: 'pluginUI',
                files: ['assets/js/index.js']
            },
            {
                name: 'jqueryUI',
                files: ['assets/js/jquery.min.js']
            }
        ]
    });

    FacebookProvider.init('182119938859848');
    GooglePlusProvider.init({
        clientId: '128931725263-6mof4j68lqvds8n6adjt5ft3b8vabtb3.apps.googleusercontent.com',
        apiKey: 'npkrrCUWstpBNG7jXEJWP1v7'
     });

    $routeProvider
    //Login Reg Router
    .when('/login', {
        templateUrl : 'pages/loginreg.html',
        access: {
            requiredLogin: false,
            isOnboarding: false
        }
    })

    //Dashboard Router
    .when('/Overview', {
        templateUrl : 'pages/dashboard.html',
        controller : 'dashboardController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    //Onboarding Router
    .when('/onboarding/setwelcome', {
        templateUrl : 'pages/onboarding/setwelcome.html',
        controller : 'onboardingController',
        access: {
            requiredLogin: true,
            isOnboarding: true
        }
    })

    .when('/onboarding/chooseplatform', {
        templateUrl : 'pages/onboarding/chooseplatform.html',
        controller : 'onboardingController',
        access: {
            requiredLogin: true,
            isOnboarding: true
        }
    })

    .when('/onboarding/addsocial', {
        templateUrl : 'pages/onboarding/addsocial.html',
        controller : 'onboardingController',
        access: {
            requiredLogin: true,
            isOnboarding: true
        }
    })

    .when('/onboarding/getembedcode', {
        templateUrl : 'pages/onboarding/getembedcode.html',
        controller : 'onboardingController',
        access: {
            requiredLogin: true,
            isOnboarding: true
        }
    })

    .when('/onboarding/getfaqs', {
        templateUrl : 'pages/onboarding/getfaqs.html',
        controller : 'onboardingController',
        access: {
            requiredLogin: true,
            isOnboarding: true
        }
    })

    //Messages Router
    .when('/Messages/Inbox', {
        templateUrl : 'pages/messages/inbox.html',
        controller : 'messagesController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Messages/Sent', {
        templateUrl : 'pages/messages/Sent.html',
        controller : 'messagesController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Messages/Drafts', {
        templateUrl : 'pages/messages/drafts.html',
        controller : 'messagesController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Messages/Trash', {
        templateUrl : 'pages/messages/trash.html',
        controller : 'messagesController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    //Contacts Router
    .when('/Contacts', {
        templateUrl : 'pages/contacts/contacts.html',
        controller : 'contactsController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Contacts/Blacklisted', {
        templateUrl : 'pages/contacts/blacklisted.html',
        controller : 'contactsController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    //KoalaBot Router
    .when('/KoalaBot', {
        templateUrl : 'pages/koalabot/koalabot.html',
        controller : 'koalabotController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/KoalaBot/FAQs', {
        templateUrl : 'pages/koalabot/faqs.html',
        controller : 'faqsController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/KoalaBot/Stylize', {
        templateUrl : 'pages/koalabot/stylize.html',
        controller : 'koalabotController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/KoalaBot/Announcements', {
        templateUrl : 'pages/koalabot/announcements.html',
        controller : 'koalabotController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    //Apps Router
    .when('/Apps', {
        templateUrl : 'pages/apps/apps.html',
        controller : 'appsController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Apps/BotIntegrations', {
        templateUrl : 'pages/apps/botintegrations.html',
        controller : 'appsController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Apps/HelpIntegrations', {
        templateUrl : 'pages/apps/helpintegrations.html',
        controller : 'appsController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    //GrowthHacks Router
    .when('/GrowthHacks', {
        templateUrl : 'pages/growthhacks/growthhacks.html',
        controller : 'growthhacksController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    //Profile Router
    .when('/Profile', {
        templateUrl : 'pages/profile/profile.html',
        controller : 'profileController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Profile/Billing', {
        templateUrl : 'pages/profile/billing.html',
        controller : 'profileController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Profile/EmbedCodes', {
        templateUrl : 'pages/profile/embedcodes.html',
        controller : 'profileController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Profile/Notifications', {
        templateUrl : 'pages/profile/notifications.html',
        controller : 'profileController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .when('/Profile/Team', {
        templateUrl : 'pages/profile/team.html',
        controller : 'profileController',
        access: {
            requiredLogin: true,
            isOnboarding: false
        }
    })

    .otherwise({ redirectTo: '/login' });

    $locationProvider.html5Mode(true);
});

myApp.run(function($window, $rootScope, $location, UserService) {
    $rootScope.$on('$routeChangeStart', function(event, nextRoute, currentRoute) {
        //1. FTU - User is registering / onboarding
        // if (nextRoute.access != undefined && nextRoute.access.isOnboarding && UserService.getIsLogged){
        //     $location.path(nextRoute.originalPath);
        // }
        // else {
        //     $location.path('/login');
        // }
        //
        // //2. User is logging in his existing account
        // if (nextRoute.access != undefined && nextRoute.access.requiredLogin && UserService.getIsLogged) {
        //     $location.path(nextRoute.originalPath);
        // }
        // else {
        //     $location.path('/login');
        // }
        //
        // if(!$window.localStorage.token || $window.localStorage.token == undefined || $window.localStorage.token === 'undefined'){
        //     $location.path('/login');
        // }
    });
});

myApp.controller('messagesController', ['$scope', '$routeParams', function($scope, $routeParams){


}]);

myApp.controller('contactsController', ['$scope', '$routeParams', function($scope, $routeParams){


}]);

myApp.controller('koalabotController', ['$scope', '$routeParams', function($scope, $routeParams){


}]);

myApp.controller('appsController', ['$scope', '$routeParams', function($scope, $routeParams){


}]);

myApp.controller('growthhacksController', ['$scope', '$routeParams', function($scope, $routeParams){


}]);

myApp.controller('profileController', ['$scope', '$routeParams', function($scope, $routeParams){


}]);

myApp.controller('secondController', ['$scope', '$routeParams', function($scope, $routeParams){


}]);

myApp.controller('navbarController', ['$scope', function($scope){
    $scope.state = true;
}]);

myApp.directive('script', function() {
    return {
      restrict: 'E',
      scope: false,
      link: function(scope, elem, attr) {
        if (attr.type=='text/javascript-lazy') {
          var code = elem.text();
          var f = new Function(code);
          f();
        }
      }
    };
  });
