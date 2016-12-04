'use strict';

angular.
	module('parcDetails').
	component('parcdetails',{
	templateUrl: 'app/parcDetails/parcDetails.template.html'	,
	controller: function parcListController($scope,$firebaseObject,$firebaseArray,$rootScope,$timeout) {
		$scope.parc = $rootScope.selectedParc; 
		$scope.displayed = false;

		$scope.closeParcDetails = function(){
			 $rootScope.selectedKey= 0;
			 $rootScope.$broadcast("display:displayList", true);
			 $scope.displayed = false;	
		}
		

		angular.element(document).ready(function () {
   		 	 componentHandler.upgradeAllRegistered();
		});

		
		$scope.requestUpdate = function(){
			$rootScope.$broadcast("parc:requestParcToBeUpdated", true);	
			$scope.displayed = false;
		}

		// Saves a new message on the Firebase DB.
		$scope.saveReview = function() {  
			  // Check that the user entered a message and is signed in.
			  if ($('#message')[0].value && $rootScope.firebaseUser.user) {
			    var currentUser = $rootScope.firebaseUser.user;
			    var reviewRef = firebase.database().ref('positions/'+$rootScope.selectedKey+'/reviews');
			    // Add a new message entry to the Firebase Database.
			    reviewRef.push({
			      name: currentUser.displayName,
			      text: $('#message')[0].value,
			      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
			    }).then(function() {
			      console.log('done')
			    }.bind(this)).catch(function(error) {
			      console.error('Error writing new message to Firebase Database', error);
			    });
			  }
			};


      	$scope.initReviews = function(){
      		var reviewsRef = firebase.database().ref('positions/'+$rootScope.selectedKey+'/reviews');
 			// Make sure we remove all previous listeners.
  			reviewsRef.off();  
  		   	var query = reviewsRef.limitToLast(100);
    		var reviews = [];
    		reviewsRef.on("value", function(snapshot) {
    			console.log(snapshot.val());
        		$scope.parc.reviews = snapshot.val();	
     			$timeout(function(){
        			$scope.$apply();		
      			},100);
        	});

      	}

		$scope.$on('parc:toBeDisplayed', function(event,parc) {
			$scope.parc =parc;
			$scope.displayed = true;
      		$timeout(function(){
        		$scope.initReviews();
        		$scope.$apply();
        		console.log(parc);
      		},100);
  		});

  		$scope.$on('parc:parcDetailsDisplay', function(event,boolean) {
			$scope.displayed = boolean;
      		$timeout(function(){
        		$scope.$apply();
      		},100);
  		});

  		
  		
	}
});