(function(){
    'use strict';

    var services = angular.module('ddsApp.services');

    services.factory('ddsApp.services.WeatherSrvc',
    ['$rootScope', '$http', '$q', '$window', 'localStorageService', function($rootScope, $http, $q, $window, localStorageService){
        var URLWEATHER = 'http://api.openweathermap.org/data/2.5/weather?lat={0}&lon={1}&mode=json&units={2}&callback=JSON_CALLBACK';

        var MSGWEATHERLOADERROR = 'Could not load the Weather call';
        var MSGGEOLOCATIONNOTSUPPORTED = 'GEO Location not supported';

        var _configuration, _geoPosition;

        var that = this;//Hack for calling private functions and variables in the return statement

        this.geoLocation = function(){
            if(Modernizr.geolocation){
                var options = {maximumAge:60000, timeout:10000,enableHighAccuracy:true};

                $window.navigator.geolocation.getCurrentPosition(this.geoLocationSuccess, this.geoLocationError,options);
            }else{
                this.geoLocationFallback();
            }
        };

        this.geoLocationSuccess = function(position){
            _geoPosition = position;
            $rootScope.$broadcast("GEOSUCCESS");
        };

        this.geoLocationError = function(error){
            switch(error){
                //Timeout
                case 3:
                    geoLocation();
                    break;
                    //POSITION UNAVAILABLE
                case 2:
                    geoLocation();
                    break;
                    //PERMISSION DENIED --> FALLBACK
                case 1:
                    geoLocationFallback();
                    break;
                default:
                    geoLocation();
                break;
            }
        };

        this.geoLocationFallback = function(){
            $rootScope.$broadcast("GEOERROR");

        };

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
                        console.log(data);
                        deferred.resolve(data);
                    }).
                    error(function(data, status, headers, config){
                        deferred.reject(MSGWEATHERLOADERROR);
                        console.log(data + ' ' + status + ' ' + headers);
                    });

                return deferred.promise;//Always return a promise
            },
            getGEOLocation : function(){
                var deferred = $q.defer();

                $rootScope.$on('GEOSUCCESS', function(ev){
                    deferred.resolve(_geoPosition);
                });

                $rootScope.$on('GEOERROR', function(ev){
                    deferred.reject(MSGGEOLOCATIONNOTSUPPORTED);
                });

                that.geoLocation();
                
                return deferred.promise;//Always return a promise
            }
        };
    }]);
})();