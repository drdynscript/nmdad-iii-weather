'use strict';

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

angular.module('LocalStorageModule').value('prefix', 'dds_scholen');

angular.module('ddsApp.controllers', []);
angular.module('ddsApp.services', []);
angular.module('ddsApp.directives', []);
angular.module('ddsApp.filters', []);

var app = angular.module('ddsApp', [
    'ngRoute',
    'ngResource',
    'ddsApp.controllers',
    'ddsApp.services',
    'ddsApp.directives',
    'ddsApp.filters',
    'LocalStorageModule'
])
.config(['$routeProvider','$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider){
        $httpProvider.defaults.useXDomain = true;//Cross Domain Calls --> Ok Ready
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $routeProvider.when('/', {
            templateUrl:'views/main.html',
            controller:'ddsApp.controllers.MainCtrl',
            resolve: {
                weather: appCtrl.loadLocalWeather
            }
        });

        $routeProvider.when('/app', {
            templateUrl:'views/app.html',
            controller:'AppCtrl',
            resolve: {
                appInitialized: appCtrl.loadConfiguration
            }
        });

        $routeProvider.otherwise({redirectTo: '/'});
    }])
.run(['$rootScope', '$timeout', '$location', 'ddsApp.services.WeatherSrvc',function($rootScope, $timeout, $location, ScholenSrvc){
        $rootScope.appInitialized = false;

        $rootScope.$on('$routeChangeStart', function(event, next, current){
            if(!$rootScope.appInitialized){
                $location.path('/app');
            }else if($rootScope.appInitialized && $location.path() === '/app'){
                $location.path('/');
            }
        });
    }]);

/*
 AppCtrl
 =======
 Controller for the App
 ----------------------
 * Load Data Via the services
 * Return the promises
 * Resolve for each route
 */
var appCtrl = app.controller('AppCtrl', ['$scope', '$location', 'appInitialized', function($scope, $location, appInitialized){
    if(appInitialized){
        $location.path('/');
    }
}]);

appCtrl.loadConfiguration = ['$rootScope', '$q', '$timeout', 'ddsApp.services.WeatherSrvc', function($rootScope, $q, $timeout, WeatherSrvc){
    var deferred = $q.defer();

    WeatherSrvc.loadConfiguration().then(
        function(data){
            $timeout(function(){
                $rootScope.appInitialized = true;
                deferred.resolve(data);
            },2000);
        },
        function(error){
            deferred.reject(error);
        }
    );

    return deferred.promise;
}];
appCtrl.loadLocalWeather = ['$rootScope', '$q', 'ddsApp.services.WeatherSrvc', function($rootScope, $q, WeatherSrvc){
    var deferred = $q.defer();
    
    WeatherSrvc.getGEOLocation().then(
        function(data){
            console.log(data);
            WeatherSrvc.loadWeather(data.coords.latitude, data.coords.longitude, 'metric').then(
                function(data){
                    deferred.resolve(data);
                },
                function(error){
                    deferred.reject(error);
                }
            );
        },
        function(error){
            console.log(error);
            deferred.reject(error);

        }
    );

    return deferred.promise;
}];
