'use strict';

angular.
	module('map').
	component('map',{
	templateUrl: 'app/map/map.template.html',
	controller: function testController($scope,$firebaseObject,$firebaseArray,$rootScope,$timeout,$state,$convert) {
		this.parcs=[];
		this.address="";
		this.firebaseRef = firebase.database().ref('geofire');
      	this.geoFire = new GeoFire(this.firebaseRef);
		this.geoQuery = this.geoFire.query({
    			center: [0,0],
    			radius: 10  
  			});
		this.markerCluster;
		

		this.init = function(){		
			$rootScope.map =  $('#map');
	
			var mapElement = $('#map')[0];
			$rootScope.map = new google.maps.Map(mapElement, {
			    center: {lat: 0, lng: 0},
			    zoom: 5,
			    styles: [{
			      featureType: 'poi',
			      stylers: [{ visibility: '' }]  // Turn off points of interest.
			    }, {
			      featureType: 'transit.station',
			      stylers: [{ visibility: 'on' }]  // Turn off bus stations, train stations, etc.
			    }],
			    disableDoubleClickZoom: false ,
			    mapTypeId: google.maps.MapTypeId.ROADMAP,
			    mapTypeControlOptions: {
    				style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
  				}
			});

			var address = $('#location')[0];
			$('#listCard').height(this.windowHeight);
	 		var searchBox = new google.maps.places.SearchBox(address);
	 		var geocoder = new google.maps.Geocoder();
    		searchBox.addListener('places_changed', function(){
      			this.geocodeAddress(geocoder);
      			

    		}.bind(this));

	  		// Bias the SearchBox results towards current map's viewport.
	  		$rootScope.map.addListener('bounds_changed', function() {
	    		searchBox.setBounds($rootScope.map.getBounds());
	 		});

	 		var centerControlDiv = document.createElement('div');
	    	var centerControl = new CenterControl(centerControlDiv,this);
	   	 	centerControlDiv.index = 1;
	    	$rootScope.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

	    	// Try HTML5 geolocation.
		   if (navigator.geolocation) {
		   		console.log("geolocation activated");
		    	navigator.geolocation.getCurrentPosition(function(position) {
		      		var pos = {
		        		lat: position.coords.latitude,
		        		lng: position.coords.longitude
		      		};
		      		$rootScope.map.setCenter(pos);
		      		$rootScope.map.setZoom(14);
		   		});
			}
			


			$rootScope.map.addListener('dragend', function() {
    			this.geoQuery.updateCriteria({
     				center: [$rootScope.map.getCenter().lat(),$rootScope.map.getCenter().lng()]
   				});
  			 	this.geoQuery.cancel();
  			 	this.displayParcsAround(false);
			}.bind(this));

	    	function CenterControl(controlDiv, proto) {
	    		var controlUIAddParc = $('#controlUIAddParc').get(0);
	    		
	  			var controlTextAddParc = $('#controlTextAddParc').get(0);
	        	controlUIAddParc.style.backgroundColor = '#fff';
	        	controlUIAddParc.style.border = '2px solid #fff';
	        	controlUIAddParc.style.borderRadius = '3px';
	        	controlUIAddParc.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
	        	controlUIAddParc.style.cursor = 'pointer';
	        	controlUIAddParc.style.marginBottom = '22px';
	        	controlUIAddParc.style.textAlign = 'center';
	        	controlUIAddParc.title = 'Add New Parc';
	        	controlDiv.appendChild(controlUIAddParc);

	        	// Set CSS for the control interior.
	        	controlTextAddParc.style.color = 'rgb(25,25,25)';
	        	controlTextAddParc.style.fontFamily = 'Roboto,Arial,sans-serif';
	        	controlTextAddParc.style.fontSize = '16px';
	        	controlTextAddParc.style.lineHeight = '38px';
	        	controlTextAddParc.style.paddingLeft = '5px';
	        	controlTextAddParc.style.paddingRight = '5px';
	        	controlTextAddParc.innerHTML = 'Add New Parc';
	        	controlUIAddParc.appendChild(controlTextAddParc);

	        	controlUIAddParc.addEventListener('click', function(){
	        		var marker = new google.maps.Marker({
           				position: {lat: $rootScope.map.getCenter().lat(), lng: $rootScope.map.getCenter().lng()},
            			map: $rootScope.map,
            			draggable: true,
          			});
          			
	        		$rootScope.$broadcast("parc:requestForAdd",marker);
	        	});
	        }
	        this.markerCluster = new MarkerClusterer($rootScope.map, $rootScope.markers, {imagePath: '../images/m'});
	        this.displayParcsAround();
      	}

      	this.geocodeAddress = function(geocoder) {
        	var address = document.getElementById('location').value;
        	geocoder.geocode({'address': address}, function(results, status) {
	          	if (status === google.maps.GeocoderStatus.OK) {
	            	$rootScope.map.setCenter(results[0].geometry.location);
	            	$rootScope.map.setZoom(14);
	           		this.geoQuery.updateCriteria({
	              		center: [$rootScope.map.getCenter().lat(),$rootScope.map.getCenter().lng()]
	            	});
	            	this.address = results[0];

	            	$rootScope.$broadcast("display:displayList", true);
	            	this.displayParcsAround(true);
      				$rootScope.$broadcast("parc:parcDetailsDisplay", false);
      				$rootScope.$broadcast("parc:requestParcToBeUpdated", false);
      				//$state.go("list", {"place_id": this.address.place_id} );
	      		} else {
	       			alert('Geocode was not successful for the following reason: ' + status);
	      		}
        	}.bind(this));
     	}

      	this.displayParcsAround = function(cleanParc){
      		if(cleanParc){
    			this.cleanParcsDisplayed();
  				this.geoQuery.cancel();
 			}
 			this.updateDistance();
      		this.geoQuery = this.geoFire.query({
    			center: [$rootScope.map.getCenter().lat(),$rootScope.map.getCenter().lng()],
    			radius: 10  
  			});

  			var onKeyEnteredRegistration = this.geoQuery.on("key_entered", function(key, location, distance) {

  				var positionRef = firebase.database().ref('positions/'+key);
  				//console.log($rootScope.parcKeys +" key: "+ key +" | result: "+ $rootScope.parcKeys.indexOf(key));
  				if($rootScope.parcKeys.indexOf(key) === -1) {
	  				
	          		positionRef.on("value", function(snapshot) {

	           			var parc = snapshot.val();
	           			parc.key = key;
	           			parc.distance = distance.toString().substring(0,4);
	           			parc.reviewsLength= 0;
	           			if(parc.reviews){ parc.reviewsLength = Object.keys(parc.reviews).length;}
	           			//parc.reviews = this.loadReviews(key);
	           			
	           			if($rootScope.parcKeys.indexOf(key) === -1) {
	           				
           					this.parcs.push(parc);
            				$rootScope.parcKeys.push(key);
	            		}
	            		else{
	            			
	            			for (var i=0; i<this.parcs.length; i++){
	          					if(this.parcs[i].key  === key) {
	          						this.parcs[i] = parc;
	          					}

          					}
          					//this.parcs.push(parc);
          					this.markerCluster.redraw();
	            		}
	            		$rootScope.$broadcast("parcs:updated", this.parcs);
	           			this.displayParkInfo(key, parc);
	  				}.bind(this));
	          	}
          	}.bind(this));

          	var onKeyExitedRegistration = this.geoQuery.on("key_exited", function(key, location, distance) {
          		for (var i=0; i<$rootScope.parcKeys.length; i++){
	          		if($rootScope.parcKeys[i] === key) {
	          			$rootScope.parcKeys.splice(i,1);
	          		}
	          	}
	          	for (var i=0; i<this.parcs.length; i++){
	          		if(this.parcs[i].key  === key) {
	          			this.parcs.splice(i,1);
	          		}
          		}	
			}.bind(this));
      	}
      	this.updateDistance = function(){

	        for (var i=0; i<this.parcs.length; i++){
	      		this.parcs[i].distance = GeoFire.distance(
	      			[$rootScope.map.getCenter().lat(),$rootScope.map.getCenter().lng()],
	      			[this.parcs[i].position.lat, this.parcs[i].position.lng]
	      		).toString().substring(0,4);;
	      	}
	      	$timeout(function(){
        		$scope.$apply();
      		},100);

      	}
      	this.cleanParcsDisplayed = function(){
			for (var i=0; i<$rootScope.markers.length; i++){	  	
			  	$rootScope.markers[i].setMap(null);
			}
			this.parcs = [];
			$rootScope.$broadcast("parcs:updated", this.parcs);	
			$rootScope.parcKeys=[];
			$rootScope.markers =[];
			this.markerCluster.clearMarkers();
		}


      	this.displayParkInfo = function(key,parc){
      		 //console.log(">>playParkInfo");
			var newPosition = parc.position;
			var infowindow = new google.maps.InfoWindow();
			var latLng = new google.maps.LatLng(newPosition.lat, newPosition.lng); 
			var icon = '../../images/markerCommunity.png';

			if(parc.source !="community"){
   				icon= '../../images/markerCity.png';
  			}
 			if(!parc.open){
    			icon= "http://maps.google.com/mapfiles/ms/icons/grey.png";
  			}
			var marker = new google.maps.Marker({
			    position: latLng,
			    map: $rootScope.map,
			    title: parc.name,
			    icon:icon,
			    key: key,    
			  });
			marker.addListener('click', function() {
          		$rootScope.selectedKey = parc.key;
      			$rootScope.selectedParc= parc;
      			$rootScope.$broadcast("parc:toBeDisplayed", parc);
      			$rootScope.$broadcast("display:displayList",false);

          	});
          	var markerExist = false;
          	for(var i=0; i<$rootScope.markers.length; i++){
          		//update a part
          		if($rootScope.markers[i].key === key){
          			$rootScope.markers[i].name = parc.name;
          			markerExist = true;
          		}
          	}
			if(!markerExist) {
    			$rootScope.markers.push(marker);
    			this.markerCluster.addMarker(marker, true);
  			}  
      	}

      	this.loadReviews = function(selectedParcKey){
      		var reviewsRef = firebase.database().ref('positions/'+selectedParcKey+'/reviews');
 			// Make sure we remove all previous listeners.
  			reviewsRef.off();  
  		   	var query = reviewsRef.limitToLast(100);
    		var reviews = [];
    		reviewsRef.on("value", function(snapshot) {
     			snapshot.forEach(function(reviewSnapshot) {
        		reviews.push(reviewSnapshot.val());
        		});
        	});

        	return reviews;
      	}

      	$scope.$on('parc:toBeDisplayed', function(event, parc) {
      		
    	});
      	
  		angular.element(document).ready(function () {
   		 	$scope.$ctrl.init();  		
		});
	}
});