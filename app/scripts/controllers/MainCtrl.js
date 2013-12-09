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
