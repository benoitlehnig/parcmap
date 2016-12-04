
  'use strict';

  angular.module('sampleApp', ['firebase', 'map', 'parcList', 'parcDetails', 'headerParcmap', 'parcUpdate'])
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
        })
    });

