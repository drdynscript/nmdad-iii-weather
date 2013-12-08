(function(){
    'use strict';

    var filters = angular.module('ddsApp.filters');

    filters.filter('WeatherValueFltr',function(){
        return function(value, trailingdecimals) {
            var v = parseFloat(value);
            return v.toFixed(trailingdecimals);
        }
    });
    
    filters.filter('WeatherDateFilter',function(){
        return function(value, dateFormat) {
            var date = new Date(value*1000);
            return $.format.date(date, dateFormat);
        }
    });    
    
})();