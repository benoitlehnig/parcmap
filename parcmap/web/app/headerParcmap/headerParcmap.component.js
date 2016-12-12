'use strict';

angular.
	module('headerParcmap').
	component('headerparcmap',{
	templateUrl: 'app/headerParcmap/headerParcmap.template.html'	,
	controller: function testController($scope,$firebaseObject,$firebaseArray,$firebaseAuth,$rootScope) {
		$scope.auth = $firebaseAuth();
		$scope.firebaseUser={};
		$scope.signIn = function() {
			var provider = new firebase.auth.GoogleAuthProvider();
  			$scope.auth.$signInWithPopup(provider).then(function(firebaseUser) {
        		$scope.firebaseUser = firebaseUser;
        		$rootScope.firebaseUser = firebaseUser;
        		var profilePicUrl = firebaseUser.user.photoURL;
    			$('#user-pic')[0].style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
      		}).catch(function(error) {
        		$scope.error = error;
     		});
		}
		$scope.signOut = function() {
			$scope.auth.$signOut();
		}

		// any time auth state changes, add the user data to scope
    	$scope.auth.$onAuthStateChanged(function(firebaseUser) {
     		if(firebaseUser !=null){
     			$scope.firebaseUser.user = firebaseUser;
     			$rootScope.firebaseUser.user = firebaseUser;
     			var profilePicUrl = firebaseUser.photoURL;
    			$('#user-pic')[0].style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    		}
    		else{
    			$scope.firebaseUser.user = "";
     			$rootScope.firebaseUser.user = "";
    		}
   		 });


		angular.element(document).ready(function () {
   		 	componentHandler.upgradeAllRegistered();
   		 	
		});
	}
});