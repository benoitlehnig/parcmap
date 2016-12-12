
  'use strict';

  angular.module('sampleApp', ['firebase', 'map', 'parcList', 'parcDetails', 'headerParcmap', 'parcUpdate','ui.router', 'Convert.Service'])
   .run(function ($rootScope,$timeout) {

   		$rootScope.map;
   		$rootScope.parcs=[];
   		$rootScope.parcKeys=[];
   		$rootScope.markers=[];
   		$rootScope.selectedKey=0;
   		$rootScope.selectedParc=0;
   		$rootScope.firebaseUser={};
   		$rootScope.markerCluster;
      $rootScope.$on('$viewContentLoaded', function(event) {
          $timeout(function() {
            componentHandler.upgradeAllRegistered();
          })
      });

})
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

       $urlRouterProvider.otherwise('/');

        $stateProvider.state('contacts', {
          url: "/contacts",
          templateUrl: "app/parcList/parcList.template.html",
          controller: function($scope){
            $scope.title = 'My Contacts';
          }
        });
        $stateProvider.state('list', {
          params: {
            place_id: null,
          },
          url: "/list/address/:place_id"        
        });
        $stateProvider.state('admin', {
          url: "/admin",
          templateUrl: "app/admin/admin.template.html"  
        });
      }
    ]).

  directive('resize', function ($window) {
    return function (scope, element) {
        var w = angular.element($window);
        scope.getWindowDimensions = function () {
            return { 'h': w.height(), 'w': w.width() };
        };
        scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
            scope.windowHeight = newValue.h;
            scope.windowWidth = newValue.w;

            scope.style = function () {
                return { 
                    'height': (newValue.h - 150) + 'px'
                };
            };

        }, true);

        w.bind('resize', function () {
            scope.$apply();
        });
    }
});
