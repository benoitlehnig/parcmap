'use strict';

angular.
	module('parcList').
	component('parclist',{
	templateUrl: 'app/parcList/parcList.template.html'	,
	controller: function parcListController($scope,$firebaseObject,$firebaseArray,$rootScope,$timeout) {
	 
    $scope.parcs=[];
    $scope.displayed = true;

    $scope.displayParcDetails = function(parc){
      $rootScope.selectedKey = parc.key;
      $rootScope.selectedParc= parc;
      $rootScope.$broadcast("parc:toBeDisplayed", parc);
      var latLng = new google.maps.LatLng(parc.position.lat, parc.position.lng);
      $rootScope.map.setCenter(latLng);
      $rootScope.map.setZoom(18);
      $scope.displayed = false;
    }

    $scope.$on('parcs:updated', function(event, parcs) {
      $scope.parcs = parcs;
      $('#listParcsAround').hide().show(0);
      $timeout(function(){
        $scope.$apply();
      },100);
      
    })

    $scope.$on('display:displayList', function(event,boolean) {
        $scope.displayed = boolean;
        $rootScope.map.setZoom(14);
          $timeout(function(){
            $scope.$apply();
          },100);
      });


    $scope.$on('parc:toBeDisplayed', function(event, parc) {
      for (var i = 0; i < $scope.parcs.length; i++){
            if ($scope.parcs[i].key == $rootScope.selectedKey){
              $scope.parcs[i].name = parc.name;
          }
        }
      $timeout(function(){
        $scope.$apply();
      },100);
      
    })
  }
});