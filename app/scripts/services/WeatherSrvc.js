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