(function(){
    'use strict';

    var controllers = angular.module('ddsApp.controllers');

    controllers.controller('ddsApp.controllers.MainCtrl',['$scope', 'weather', function($scope, weather){
        $scope.weather = weather;

        $scope.getClimaCon = function(iconId){
            switch(iconId){
                case 801:
                    return 'climafontsize climacon cloud sun';
                default:
                    return ' climacon sun'
            }
        }
    }]);
})();
