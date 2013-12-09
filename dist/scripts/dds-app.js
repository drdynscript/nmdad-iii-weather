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
            deferred.reject(error);
        }
    );

    return deferred.promise;
}];

(function(){
    'use strict';

    var filters = angular.module('ddsApp.filters');

    filters.filter('WeatherValueFltr',function(){
        return function(value, trailingdecimals) {
            var v = parseFloat(value);
            return v.toFixed(trailingdecimals);
        };
    });
    
    filters.filter('WeatherDateFilter',function(){
        return function(value, dateFormat) {
            var date = new Date(value*1000);
            return $.format.date(date, dateFormat);
        };
    });    
    
})();
(function(){
    'use strict';

    var controllers = angular.module('ddsApp.controllers');

    controllers.controller('ddsApp.controllers.MainCtrl',['$scope', 'weather', function($scope, weather){
        $scope.weather = weather;

        $scope.getClimaCon = function(iconId){
            switch(iconId){
                case 801:
                    return ' climacon cloud sun';
                case 804:
                    return ' climacon cloud';
                default:
                    return ' climacon sun';
            }
        };
    }]);
})();

(function(){
    'use strict';

    var services = angular.module('ddsApp.services');

    services.factory('ddsApp.services.WeatherSrvc',
    ['$rootScope', '$http', '$q', 'localStorageService', function($rootScope, $http, $q, localStorageService){
        var URLWEATHER = 'http://api.openweathermap.org/data/2.5/weather?lat={0}&lon={1}&mode=json&units={2}&callback=JSON_CALLBACK';

        var MSGWEATHERLOADERROR = 'Could not load the Weather call';
        var MSGGEOLOCATIONNOTSUPPORTED = 'GEO Location not supported';

        var _configuration, _geoPosition;

        var that = this;//Hack for calling private functions and variables in the return statement

        return{
            loadConfiguration:function(){
                var deferred = $q.defer();
                deferred.resolve(true);
                return deferred.promise;//Always return a promise
            },
            loadWeather : function(lat, long, units){
                var deferred = $q.defer();

                var url = URLWEATHER.format(lat, long, units);

                $http.jsonp(url).
                    success(function(data, status, headers, config){
                        deferred.resolve(data);
                    }).
                    error(function(data, status, headers, config){
                        deferred.reject(MSGWEATHERLOADERROR);
                    });

                return deferred.promise;//Always return a promise
            },
            getGEOLocation : function(){
                var deferred = $q.defer();
                
                if(Modernizr.geolocation){
                    navigator.geolocation.getCurrentPosition(
                        function(position){
                            _geoPosition = position;
                            deferred.resolve(position);
                        },
                        function(error){
                            deferred.reject(MSGGEOLOCATIONNOTSUPPORTED);
                        },
                        {timeout:10000,enableHighAccuracy:true}
                    );
                }else{
                    deferred.reject(MSGGEOLOCATIONNOTSUPPORTED);
                }
                
                return deferred.promise;//Always return a promise
            }
        };
    }]);
})();