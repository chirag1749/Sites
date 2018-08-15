(function () {
  'use strict';
  angular.module('mySiteOne').config(appConfig);

  appConfig.$inject = ['$stateProvider', '$urlRouterProvider'];

  function appConfig($stateProvider, $urlRouterProvider) {

    $stateProvider.state('home', {
      url: '',
      templateUrl: 'app/mySiteOne.html'
    });
  }

})();