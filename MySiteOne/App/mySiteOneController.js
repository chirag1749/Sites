(function () {
    'use strict';
    angular.module('mySiteOne').controller('mySiteOneController', mySiteOneController);

    function mySiteOneController() {
        var vm = this;

        Init();

        function Init() {
            vm.message = "Hello World";
        }
    }
}());