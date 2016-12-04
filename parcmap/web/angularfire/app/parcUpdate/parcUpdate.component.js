'use strict';

angular.
	module('parcUpdate').
	component('parcupdate',{
	templateUrl: 'app/parcUpdate/parcUpdate.template.html'	,
	controller: function parcUpdateController($scope,$firebaseObject,$firebaseArray,$rootScope,$timeout) {
		$scope.displayed = false;
		$scope.mode ="update";
		$scope.marker;

		angular.element(document).ready(function () {
   		 	 componentHandler.upgradeAllRegistered();
		});

		$scope.close = function(){
			if($scope.mode=="update"){
				$scope.displayed = false;
				$rootScope.$broadcast("parc:parcDetailsDisplay",true);
			}
			else{
				$scope.displayed = false;
				$rootScope.$broadcast("display:displayList",true);
			}
		}
		$scope.updateParc = function(){
			var positionRef = firebase.database().ref('positions');
			var parcToUpdate = positionRef.child($rootScope.selectedKey);
    		var updatedParc= $scope.getParcJson();
 	    	parcToUpdate.update(updatedParc);
	    	var location=[updatedParc.position.lat, updatedParc.position.lng];
	   		//console.log ("pushing to geofire >>" +newPosition.path.o[1]  + ","+ selectedParcLonLat);
	   		var geoFire = new GeoFire(firebase.database().ref('geofire'));
	   		geoFire.set(parcToUpdate.path.o[1], location).then(function() {
	      		console.log(parcToUpdate.path.o[1] + " initially set to [" + location + "]");
	    	})
	    	updatedParc.key = $rootScope.selectedKey;
	    	$rootScope.selectedParc = updatedParc;
	    	$rootScope.$broadcast("parc:toBeDisplayed",updatedParc);
			$scope.displayed = false;
		}

		$scope.addParc = function(){
			var positionRef = firebase.database().ref('positions');
    		var newPosition = positionRef.push();
    		var newParc= $scope.getParcJson();
    		newParc.source ="community";
    	
	    	newPosition.set(newParc);
    		var location=[newParc.position.lat, newParc.position.lng];
    		var geoFire = new GeoFire(firebase.database().ref('geofire'));

    		geoFire.set(newPosition.path.o[1], location).then(function() {
      				console.log(newPosition.path.o[1] + " initially set to [" + location + "]");
      				$scope.marker.setMap(null);
      				$scope.displayed=false;
   			});
		}

		$scope.getParcJson = function(){
			var addedBy=" tester";
			if($rootScope.firebaseUser){
				var currentUser = $rootScope.firebaseUser;
				addedBy = currentUser.user.displayName;
			}
			var parcName =$('#parcName')[0].value;
    		var open = $('#open')[0].checked;
    		var swing = $('#swing')[0].checked;
    		var slide = $('#slide')[0].checked;
   			var lessThan2years = $('#lessThan2years')[0].checked;
   		 	var between2and6 = $('#between2and6')[0].checked;
    		var sixandPlus = $('#6andPlus')[0].checked;
    		var trampoline = $('#trampoline')[0].checked;
    		var water = $('#water')[0].checked;
    		var parcDescription = $('#parcDescription')[0].value;
    		var selectedParcLonLat; 
    		if($scope.mode=="add"){
				selectedParcLonLat = $scope.marker.position;
    		}
    		else{
    			selectedParcLonLat= new google.maps.LatLng($rootScope.selectedParc.position);
    		}
			var returnedParc= 
			{
	     		name: parcName ,
	      		addedBy: addedBy,
	      		position: {lat: selectedParcLonLat.lat(), lng: selectedParcLonLat.lng()} ,
	      		description: parcDescription,
	      		open : open,
	      		swing : swing,
	      		slide : slide,
	      		trampoline: trampoline,
	      		lessThan2years: lessThan2years,
	      		between2and6: between2and6,
	      		sixandPlus: sixandPlus,
	      		water:water
	    	};
			return returnedParc;
		}
			
		$scope.$on('parc:requestForAdd', function(event,marker) {
			$scope.displayed = true;
			$scope.marker=marker;
			$scope.mode = "add";
			$rootScope.$broadcast("parc:parcDetailsDisplay",false);
			$rootScope.$broadcast("display:displayList",false);
			$timeout(function(){
        		$scope.$apply();
      		},100);
		});

		$scope.$on('parc:requestParcToBeUpdated', function(event, boolean) {
      		$scope.displayed = boolean;
      		if(!$rootScope.selectedParc.open)
    		{
      			$('#openLabel').removeClass('is-checked');		
    		}
    		else {
    			$('#openLabel').addClass('is-checked');
    		}
    		if(!$rootScope.selectedParc.trampoline)
    		{
      			$('#trampolineLabel').removeClass('is-checked');		
    		}
    		else {
    			$('#trampolineLabel').addClass('is-checked');
    		}
    		if(!$rootScope.selectedParc.swing)
    		{
      			$('#swingLabel').removeClass('is-checked');		
    		}
    		else {
    			$('#swingLabel').addClass('is-checked');
    		}
    		if(!$rootScope.selectedParc.slide)
    		{
      			$('#slideLabel').removeClass('is-checked');		
    		}
    		else {
    			$('#slideLabel').addClass('is-checked');
    		}
    		if(!$rootScope.selectedParc.lessThan2years)
    		{
      			$('#lessThan2yearsLabel').removeClass('is-checked');
    		}
    		else{
    			$('#lessThan2yearsLabel').addClass('is-checked');		
    		}
    		if(!$rootScope.selectedParc.between2and6)
    		{
      			$('#between2and6Label').removeClass('is-checked');
    		}
    		else{
    			$('#between2and6Label').addClass('is-checked');		
    		}
    		if(!$rootScope.selectedParc.sixandPlus)
    		{
      			$('#between2and6Label').removeClass('is-checked');
    		}
    		else{
    			$('#between2and6Label').addClass('is-checked');		
    		}
    		if(!$rootScope.selectedParc.water)
    		{
      			$('waterLabel').removeClass('is-checked');
    		}
    		else{
    			$('#waterLabel').addClass('is-checked');		
    		}
    		$('#parcNameLabel')[0].parentNode.MaterialTextfield.checkDirty();
    		$('#parcDescriptionLabel')[0].parentNode.MaterialTextfield.checkDirty();
   		 })

  	}
});