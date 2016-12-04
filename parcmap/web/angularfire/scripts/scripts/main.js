/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 'use strict';


// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();
  this.map;
  this.markers=[];
  this.parcKeys=[];
  this.markerCluster;

  this.countOfParcs = $('countOfParcs');
  //labels
  this.updateCardLabel ="Update Parc";
  this.addNewParcLabel = "Add New Parc";

  this.importXMLButton = $('#importXML');
  this.importXMLButton.bind('click',this.importXML.bind(this));
  this.importJSONButton = $('#importJSON');
  this.importJSONButton.bind('click', this.importJSON.bind(this));

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById("messages");
  this.messageForm = document.getElementById('message-form');
  this.messageInput = document.getElementById('message');
  this.submitButton = document.getElementById('submit');
  this.submitImageButton = document.getElementById('submitImage');
  this.imageForm = document.getElementById('image-form');
  this.mediaCapture = document.getElementById('mediaCapture');
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');
  this.listParcsAround = document.getElementById('listParcsAround');

  this.parcDetailsContainer = document.getElementById('parcDetailsContainer');
  this.mapContainer = document.getElementById('mapContainer');
  this.closeparcDetailsContainterIcon = document.getElementById('closeDetails');
  // new parc
  this.cardTitle = document.getElementById('cardTitle');
  this.addNewParcCard= document.getElementById('addNewParcCard');
  this.addParcOKButton =  document.getElementById('addParcOKButton');
  this.updateParcOKButton = document.getElementById('updateParcOKButton');
  this.updateParcOKButton.addEventListener('click', this.updateParc.bind(this) );
  this.addParcOKButton.addEventListener('click', this.addParc.bind(this) );
  this.addParcCancelButton = document.getElementById('addParcCancelButton');
  this.addParcCancelButton.addEventListener('click', this.closePopup.bind(this));
  this.newParcLonLat = document.getElementById('newParcLonLat');
  
  //properties of current
  this.parcName = document.getElementById('parcName');
  this.parcDescription = document.getElementById('parcDescription');
  this.parcDescriptionLabel = document.getElementById('parcDescriptionLabel');
  this.parcNameLabel = document.getElementById('parcNameLabel');
  this.parcOpen = document.getElementById('open');
  this.parcOpenLabel = $('#openLabel');
  this.parcSwing = document.getElementById('swing');
  this.parcTrampoline = document.getElementById('trampoline');
  this.parcSlide = document.getElementById('slide');
  this.lessThan2years = document.getElementById('lessThan2years');
  this.between2and6 = document.getElementById('between2and6');
  this.sixandPlus = document.getElementById('6andPlus');
  this.reviewPanel = document.getElementById('review-panel');
  //this.reviewPanel.addEventListener('click', this.loadReviews.bind(this));

  //properties of selected parc

  this.selectedParc = {};


  this.parcDetails = document.getElementById('parcDetails');
  this.parcDetailsName = document.getElementById('parcDetailsName');
  this.parcDetailsFacilities = document.getElementById('parcDetailsFacilities');
  this.parcDetailsAge = document.getElementById('parcDetailsAge');
  this.parcDetailsAddedBy = document.getElementById('parcDetailsAddedBy');
  this.updateParcButton = $('#updateParc');
  this.updateParcButton.bind('click', this.requestUpdateParc.bind(this));
  this.parcDetailsClose = document.getElementById('parcDetailsClose');
  this.parcDetailsDescription = document.getElementById('parcDetailsDescription');
  this.parcDetailspictureIMG = document.getElementById('parcDetailspictureIMG');
  this.parcDetailsLittle = document.getElementById('parcDetailsLittle');
  this.parcDetailsMiddle = document.getElementById('parcDetailsMiddle');
  this.parcDetailsOld = document.getElementById('parcDetailsOld');
  this.trampolineImg = document.getElementById('trampolineImg');
  this.swingImg = document.getElementById('swingImg');
  this.slideImg = document.getElementById('slideImg');

  this.closeparcDetailsContainterIcon.addEventListener('click', this.closeSidePanel.bind(this));

  //map  
  this.controlUIAddParc = document.getElementById('controlUIAddParc');
  this.controlTextAddParc = document.getElementById('controlTextAddParc');
  

  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.messageInput.addEventListener('keyup', buttonTogglingHandler);
  this.messageInput.addEventListener('change', buttonTogglingHandler);

  // Events for image upload.
  this.submitImageButton.addEventListener('click', function() {
    this.mediaCapture.click();
  }.bind(this));
  this.mediaCapture.addEventListener('change', this.saveImageMessage.bind(this));

  this.initmap();
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
   // Generate a random Firebase location
   this.firebaseRef = firebase.database().ref('geofire');
  // Create a new GeoFire instance at the random Firebase location
  this.geoFire = new GeoFire(this.firebaseRef);
  this.geoQuery = this.geoFire.query({
    center: [this.map.getCenter().lat(),this.map.getCenter().lng()],
    radius: 10  
  });

  this.firebaseRefParcTypes = firebase.database().ref('reference/partTypes');

  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
  var onReadyRegistration = this.geoQuery.on("ready", function() {
    console.log("GeoQuery has loaded and fired all other events for initial data");
  });  
};


// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.importXML = function() {
  var xmlhttp;
  if (window.XMLHttpRequest)       
  {// code for IE7+, Firefox, Chrome, Opera, Safari
   xmlhttp=new XMLHttpRequest();
 }
 else
    {// code for IE6, IE5
      xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onload = function() {
      var xmlDoc = new DOMParser().parseFromString(xmlhttp.responseText,'text/xml');

      console.log(xmlDoc);


      var x=xmlDoc.getElementsByTagName("content");
      for (var i=0;i<x.length;i++)
      { 
            //add a new position
            // Check that the user is signed in.
            if (this.checkSignedInWithMessage()) {

              var currentUser = this.auth.currentUser;
              var parcName =  x[i].getElementsByTagName("TITRE")[0].childNodes[0].nodeValue;
              var open = true;
              var swing = true;
              var slide = true;
              var lessThan2years = true;
              var between2and6 = true;
              var sixandPlus = true;
              var trampoline = true;
              var pictureUrl="";
              var description="";

              if(x[i].getElementsByTagName("DESCRIPTIF")[0]){
                description = x[i].getElementsByTagName("DESCRIPTIF")[0].childNodes[0].nodeValue;
              }
              if(x[i].getElementsByTagName("PHOTOS")[0]){
                pictureUrl = x[i].getElementsByTagName("PHOTOS")[0].childNodes[0].nodeValue.split("|")[0];
              }


      // Add a new message entry to the Firebase Database.
      console.log("addParc>> " + +" "+parcName+ " "+currentUser.displayName + " "+open+ " "+swing+ " "+slide );
      var id=x[i].getElementsByTagName("NUMID")[0].childNodes[0].nodeValue
      var positionRef = this.database.ref('positions');
      var newPosition = positionRef.child(id);
      newPosition.set({
        source:"openData-"+"jardins35fr",
        name: parcName ,
        addedBy: "tourismebretagne",
        position: {
          lat: x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue, 
          lng: x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue},
          open : open,
          description: description,
          swing : swing,
          slide : slide,
          pictureUrl: pictureUrl,
          trampoline: trampoline,
          lessThan2years: lessThan2years,
          between2and6: between2and6,
          sixandPlus: sixandPlus

        });
      
      var location=[
      Number(x[i].getElementsByTagName("LATITUDE")[0].childNodes[0].nodeValue), 
      Number(x[i].getElementsByTagName("LONGITUDE")[0].childNodes[0].nodeValue)];

      this.geoFire.set(
        x[i].getElementsByTagName("NUMID")[0].childNodes[0].nodeValue, location).then(function() {
          console.log(x[i].getElementsByTagName("NUMID")[0].childNodes[0].nodeValue + " initially set to [" + location + "]");
        })
      }


    }

  }.bind(this);


  xmlhttp.open("GET","../XML parser/jardins35fr.xml",false);
  xmlhttp.send();



}
// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.importJSON = function() {
 //nantes:
 $.getJSON("../XML parser/nantes.json", function(json) {
     // this will show the info it in firebug console
     var data =json.data
     var positionRef = this.database.ref('positions');
     var open = true;
     var swing = true;
     var slide = true;
     var lessThan2years = true;
     var between2and6 = true;
     var sixandPlus = true;
     var trampoline = true;
     var pictureUrl="";
     var description="";
     for(var i=0; i<data.length; i++){
      var positionRef = this.database.ref('positions');
      var newPosition = positionRef.child('nantes'+i);
      newPosition.set({
        source:"openData-"+"nantes",
        name: data[i].geo.name ,
        addedBy: "Nantes",
        position: {
          lat: data[i]._l[0], 
          lng: data[i]._l[1]},
          open : open,
          description: description,
          swing : swing,
          slide : slide,
          pictureUrl: pictureUrl,
          trampoline: trampoline,
          lessThan2years: lessThan2years,
          between2and6: between2and6,
          sixandPlus: sixandPlus

        });
      
      var location=[
      Number(data[i]._l[0]), 
      Number(data[i]._l[1])];

      this.geoFire.set('nantes'+i, location).then(function() {
        console.log('nantes'+i + " initially set to [" + location + "]");
      }.bind(this))
    }
  }.bind(this))

  //montpellier:
  $.getJSON("../XML parser/montpellier.json", function(json) {
     // this will show the info it in firebug console
     var data =json.features
     var open = true;
     var swing = true;
     var slide = true;
     var lessThan2years = true;
     var between2and6 = true;
     var sixandPlus = true;
     var trampoline = true;
     var pictureUrl="";
     var description="";
     for(var i=0; i<data.length; i++){
      console.log(data[i]);
      var positionRef = this.database.ref('positions');
      var newPosition = positionRef.child('montepellier'+i);
      
      newPosition.set({
        source:"openData-"+"montepellier",
        name: data[i].properties.NOM_AIRE ,
        addedBy: "montepellier",
        position: {
          lat: data[i].geometry.coordinates[0][1], 
          lng: data[i].geometry.coordinates[0][0]},
          open : open,
          description: description,
          swing : swing,
          slide : slide,
          pictureUrl: pictureUrl,
          trampoline: trampoline,
          lessThan2years: lessThan2years,
          between2and6: between2and6,
          sixandPlus: sixandPlus

        });
      
      var location=[
      Number(data[i].geometry.coordinates[0][1]), 
      Number(data[i].geometry.coordinates[0][0])];

      this.geoFire.set('montepellier'+i, location).then(function() {
        console.log('montepellier'+i + " initially set to [" + location + "]");
      }.bind(this))
    }
  }.bind(this))

 //Toulouse:
 $.getJSON("../XML parser/toulouse.json", function(json) {
     // this will show the info it in firebug console
     var data =json
     var open = true;
     var swing = true;
     var slide = true;
     var lessThan2years = true;
     var between2and6 = true;
     var sixandPlus = true;
     var trampoline = true;
     var pictureUrl="";
     var description="";
     for(var i=0; i<data.length; i++){
      console.log(data[i]);
      var positionRef = this.database.ref('positions');
      var newPosition = positionRef.child(data[i].fields.id);
      
      newPosition.set({
        source:"openData-"+"toulouse",
        name: data[i].fields.nom,
        addedBy: "toulouse",
        position: {
          lat: data[i].fields.geo_shape.coordinates[1], 
          lng: data[i].fields.geo_shape.coordinates[0]},
          open : open,
          description: description,
          swing : swing,
          slide : slide,
          pictureUrl: pictureUrl,
          trampoline: trampoline,
          lessThan2years: lessThan2years,
          between2and6: between2and6,
          sixandPlus: sixandPlus

        });
      
      var location=[
      Number(data[i].fields.geo_shape.coordinates[1]), 
      Number(data[i].fields.geo_shape.coordinates[0])];

      this.geoFire.set(data[i].fields.id, location).then(function() {
          //console.log(data[i].fields.id + " initially set to [" + location + "]");
        }.bind(this))

    }
  }.bind(this))


}


FriendlyChat.prototype.closePopup = function() {
  if(this.newMarker){
    this.newMarker.setMap(null);
  }
  this.closeParcForm();
  this.closeParcDetails();
  this.closeSidePanel();
}

FriendlyChat.prototype.closeDetails = function() {
  this.parcDetails.setAttribute('hidden',true);
  this.closeParcDetails();
  this.closeSidePanel();
}
// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('messages');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
  }.bind(this);
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
};


FriendlyChat.prototype.loadReviews = function(){
  this.cleanReview();
  this.reviewsRef = this.database.ref('positions/'+this.selectedParc.key+'/reviews');
  // Make sure we remove all previous listeners.
  this.reviewsRef.off();  
  if(this.selectedParc.key){
    var query = this.reviewsRef.limitToLast(100);
    console.log("loadReviews for : "+this.selectedParc.key);
    
    this.reviewsRef.on("value", function(snapshot) {
      snapshot.forEach(function(reviewSnapshot) {
        var review = reviewSnapshot.val();
        //console.log(review.name+","+review.text);
        this.displayMessage("", review.name, review.text, review.photoUrl, review.imageUrl);
      }.bind(this));    
    }.bind(this));
  }
} 

// init map
FriendlyChat.prototype.initmap = function() {
  this.map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 0, lng: 0},
    zoom: 15,
    styles: [{
      featureType: 'poi',
      stylers: [{ visibility: 'off' }]  // Turn off points of interest.
    }, {
      featureType: 'transit.station',
      stylers: [{ visibility: 'off' }]  // Turn off bus stations, train stations, etc.
    }],
    disableDoubleClickZoom: false ,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.TOP_CENTER
    },
    mapTypeId: google.maps.MapTypeId.HYBRID
  });
  var address = document.getElementById('location')
  var searchBox = new google.maps.places.SearchBox(address);

  // Bias the SearchBox results towards current map's viewport.
  this.map.addListener('bounds_changed', function() {
    searchBox.setBounds(this.map.getBounds());
  }.bind(this));



  var geocoder = new google.maps.Geocoder();
    //map
    searchBox.addListener('places_changed', function(){

      this.geocodeAddress(geocoder);

      this.displayParcsAround(true);
    }.bind(this));

    var centerControlDiv = document.createElement('div');
    var centerControl = new FriendlyChat.prototype.CenterControl(centerControlDiv, this.map,this);
    centerControlDiv.index = 1;
    this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

   // Try HTML5 geolocation.
   if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      this.map.setCenter(pos);
      this.geoQuery.updateCriteria({
        center: [this.map.getCenter().lat(),this.map.getCenter().lng()]
      });
      this.displayParcsAround(true);

    }.bind(this), function() {
      this.handleLocationError(true);
      var paris = new google.maps.LatLng(48.8566667, 2.3509871);
      this.map.setCenter(paris);
      this.map.setZoom(4);
      this.geoQuery.updateCriteria({
        center: [this.map.getCenter().lat(),this.map.getCenter().lng()]
      });
      this.displayParcsAround(true);
    }.bind(this));
  } else {
    // Browser doesn't support Geolocation
    this.handleLocationError(false);
  }

  this.map.addListener('dragend', function() {
    this.geoQuery.updateCriteria({
     center: [this.map.getCenter().lat(),this.map.getCenter().lng()]
   });
   // console.log(this.map.getCenter().lat()+ ","+this.map.getCenter().lng());

   this.displayParcsAround(false);

 }.bind(this));
  this.markerCluster = new MarkerClusterer(this.map, this.markers, {imagePath: 'images/m'});

};

FriendlyChat.prototype.displayParcsAround = function(cleanParc){
  if(cleanParc){
    this.cleanParcsDisplayed();
  }
  var onKeyEnteredRegistration = this.geoQuery.on("key_entered", function(key, location, distance) {
        //console.log(this.parcKeys);
        //console.log("key:" + key+" "+this.parcKeys.indexOf(key) );
        if(this.parcKeys.indexOf(key) === -1) {
          this.parcKeys.push(key);
          var positionRef = firebase.database().ref('positions/'+key);
          positionRef.on("value", function(snapshot) {
            var parc = snapshot.val();
            // console.log(key + " entered the query. Hi " +key+" ,"+ parc.name + " distance:"+distance);
            this.displayParkInfo(key, parc);
            if( distance<9){
              var li = document.createElement("li");
              li.addEventListener('click',function(){
                this.selectedParc.parc= parc;
                this.selectedParc.key= key;
                console.log(this.selectedParc);
                this.selectedParc.key = key;
                this.openSidePanel();
                //get strings  for display
                var detailStrings = this.returnDetailsString(parc);
                this.setDetails(parc.name,parc.swing,parc.slide,parc.trampoline,parc.lessThan2years,
                  parc.between2and6,parc.sixandPlus,parc.addedBy,parc.description,parc.pictureUrl);
                
                this.loadReviews();
                this.displayParcDetails();
                var latLng = new google.maps.LatLng(parc.position.lat, parc.position.lng);
                this.map.setCenter(latLng);
                this.map.setZoom(18);

              }.bind(this));
              li.setAttribute("id", "listItem"+key);
              li.setAttribute("class", "mdl-list__item mdl-list__item--two-line");
              var span = document.createElement("span");
              var span1 = document.createElement("span");
              span.setAttribute("class", "mdl-list__item-primary-content");
              span1.setAttribute("id", "listItemSpan1"+key);
              span1.innerHTML =parc.name;
              var span2 = document.createElement("span");
              span2.setAttribute("class","mdl-list__item-sub-title");
              span2.setAttribute("id","listItemSpan2"+key);
              var numberOfReview = 0; 
              
              if(parc.reviews){
                numberOfReview =  Object.keys(parc.reviews).length;
              }
              //console.log(numberOfReview);
              span2.innerHTML =distance.toString().substring(0,4)+" km | "+ numberOfReview.toString() +" reviews";
              span.appendChild(span1);
              span.appendChild(span2);
              li.appendChild(span);
              this.listParcsAround.appendChild(li);
            }
          }.bind(this));
          //console.log("markers : " + this.markers.length);

        }
        //this.markerCluster.redraw();

      }.bind(this));


  var onKeyExitedRegistration = this.geoQuery.on("key_exited", function(key, location, distance) {
      //console.log(key + " exited query to " + location + " (" + distance + " km from center)");
      var li = document.getElementById("listItem"+key);
      if(li){
        this.listParcsAround.removeChild(li);
      }
        //this.markers[key].setMap(null);
      }.bind(this));  
}

FriendlyChat.prototype.addParc = function() {
  this.savePosition(this.newMarker.position);
  this.newMarker.setMap(null);
  this.closeParcForm();
  this.closeSidePanel();
  this.cardTitle.innerHTML = this.addNewParcLabel;
  this.updateParcOKButton.setAttribute("hidden",true);
  this.addParcOKButton.removeAttribute("hidden");
}
FriendlyChat.prototype.updateParc = function() {
  // Check that the user entered a message and is signed in.
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    console.log("updating parc: "+ this.selectedParc.key+ " by: "+currentUser.displayName);
    var positionRef = this.database.ref('positions');
    var parcToUpdate = positionRef.child(this.selectedParc.key);
    var parcName = document.getElementById('parcName').value;
    var open = document.getElementById('open').checked;
    var swing = document.getElementById('swing').checked;
    var slide = document.getElementById('slide').checked;
    var addedBy = currentUser.displayName;
    var lessThan2years = document.getElementById('lessThan2years').checked;
    var between2and6 = document.getElementById('between2and6').checked;
    var sixandPlus = document.getElementById('6andPlus').checked;
    var trampoline = document.getElementById('trampoline').checked;
    var parcDescription = document.getElementById('parcDescription').value;
    var selectedParcLonLat = new google.maps.LatLng(this.selectedParc.parc.position);
    console.log("update to be done: "+parcName+ ", open: "+open+" "+selectedParcLonLat+" "+addedBy+" "+lessThan2years );
    parcToUpdate.update(
    {
      name: parcName ,
      addedBy: currentUser.displayName,
      position: {lat: selectedParcLonLat.lat(), lng: selectedParcLonLat.lng()} ,
      description: parcDescription,
      open : open,
      swing : swing,
      slide : slide,
      trampoline: trampoline,
      lessThan2years: lessThan2years,
      between2and6: between2and6,
      sixandPlus: sixandPlus
    });
    var location=[selectedParcLonLat.lat(), selectedParcLonLat.lng()];
   // console.log ("pushing to geofire >>" +newPosition.path.o[1]  + ","+ selectedParcLonLat);
   this.geoFire.set(parcToUpdate.path.o[1], location).then(function() {
      //console.log(parcToUpdate.path.o[1] + " initially set to [" + selectedParcLonLat + "]");
    })
   
   if(this.newMarker){
    this.newMarker.setMap(null);
  }
  this.markerCluster.redraw();
  this.closeParcForm();
  this.closeParcDetails();
  this.closeSidePanel();
  this.cardTitle.innerHTML = this.addNewParcLabel;
  this.updateParcOKButton.setAttribute("hidden",true);
  this.addParcOKButton.removeAttribute("hidden");

}
}



FriendlyChat.prototype.CenterControl= function(controlDiv, map,proto) {

        // Set CSS for the control border.

        proto.controlUIAddParc.style.backgroundColor = '#fff';
        proto.controlUIAddParc.style.border = '2px solid #fff';
        proto.controlUIAddParc.style.borderRadius = '3px';
        proto.controlUIAddParc.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        proto.controlUIAddParc.style.cursor = 'pointer';
        proto.controlUIAddParc.style.marginBottom = '22px';
        proto.controlUIAddParc.style.textAlign = 'center';
        proto.controlUIAddParc.title = 'Add New Parc';
        controlDiv.appendChild(proto.controlUIAddParc);

        // Set CSS for the control interior.
        proto.controlTextAddParc.style.color = 'rgb(25,25,25)';
        proto.controlTextAddParc.style.fontFamily = 'Roboto,Arial,sans-serif';
        proto.controlTextAddParc.style.fontSize = '16px';
        proto.controlTextAddParc.style.lineHeight = '38px';
        proto.controlTextAddParc.style.paddingLeft = '5px';
        proto.controlTextAddParc.style.paddingRight = '5px';
        proto.controlTextAddParc.innerHTML = 'Add New Parc';
        proto.controlUIAddParc.appendChild(proto.controlTextAddParc);


        proto.controlUIAddParc.addEventListener('click', function(){

          proto.cardTitle.innerHTML = proto.addNewParcLabel;
          proto.updateParcOKButton.setAttribute("hidden",true);
          proto.addParcOKButton.removeAttribute("hidden");
          proto.closeParcDetails();
          proto.displayParcForm();


          var marker = new google.maps.Marker({
            position: {lat: map.getCenter().lat(), lng: map.getCenter().lng()},
            map: map,
            draggable: true,
          });
          proto.newParcLonLat.value = marker.getPosition();
          google.maps.event.addListener(
            marker,
            'drag',
            function(event) {
             proto.newParcLonLat.value = this.position;
           });

          proto.newMarker = marker;
        });
      }

      FriendlyChat.prototype.displayParcDetails = function(){
        if(this.selectedParc.parc.source =="community"){
          this.updateParcButton.removeAttr('hidden');
        }
        else{
          this.updateParcButton.setAttribute('hidden',true);
        }
        this.parcDetails.removeAttribute('hidden');
        this.openSidePanel();
      }
      FriendlyChat.prototype.closeParcDetails = function(){
        this.parcDetails.setAttribute('hidden',true);
      }
      FriendlyChat.prototype.displayParcForm = function(){
        this.addNewParcCard.removeAttribute('hidden');
        this.openSidePanel();
      }
      FriendlyChat.prototype.closeParcForm = function(){
        this.addNewParcCard.setAttribute('hidden',true);
      }
      FriendlyChat.prototype.geocodeAddress = function(geocoder) {
        var address = document.getElementById('location').value;
        geocoder.geocode({'address': address}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            this.map.setCenter(results[0].geometry.location);
            this.map.setZoom(14);
            this.geoQuery.updateCriteria({
              center: [this.map.getCenter().lat(),this.map.getCenter().lng()]
            });
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        }.bind(this));
      }

      FriendlyChat.prototype.handleLocationError= function(browserHasGeolocation) {
        if(browserHasGeolocation ==false){
          console.log(  'Error: The Geolocation service failed. Error: Your browser doesn\'t support geolocation.');
        }
      }

// Saves a new location on the Firebase DB.
FriendlyChat.prototype.savePosition = function(position ) {
  // Check that the user is signed in.
  if (this.checkSignedInWithMessage()) {

    var currentUser = this.auth.currentUser;
    var parcName = this.parcName.value;
    var open = this.parcOpen.checked;
    var swing = this.parcSwing.checked;
    var slide = this.parcSlide.checked;
    var lessThan2years = this.lessThan2years.checked;
    var between2and6 = this.between2and6.checked;
    var sixandPlus = this.sixandPlus.checked;
    var trampoline = this.parcTrampoline.checked; 
    var parcDescription = this.parcDescription.value; 

    
    // Add a new message entry to the Firebase Database.
    console.log("addParc>> " + "position"+position +" "+parcName+ " "+currentUser.displayName + " "+open+ " "+swing+ " "+slide );
    this.positionRef = this.database.ref('positions');
    var newPosition = this.positionRef.push();
    
    newPosition.set({
      source:"community",
      name: parcName ,
      addedBy: currentUser.displayName,
      position: {lat: position.lat(), lng: position.lng()},
      description: parcDescription,
      open : open,
      swing : swing,
      slide : slide,
      trampoline: trampoline,
      lessThan2years: lessThan2years,
      between2and6: between2and6,
      sixandPlus: sixandPlus
    });
    
    var location=[position.lat(), position.lng()];
    this.geoFire.set(newPosition.path.o[1], location).then(function() {
      console.log(newPosition.path.o[1] + " initially set to [" + location + "]");
    })
  }
};

FriendlyChat.prototype.requestUpdateParc = function(){
  this.cardTitle.innerHTML= this.updateCardLabel;
  this.updateParcOKButton.removeAttribute("hidden");
  this.addParcOKButton.setAttribute("hidden",true);
  console.log("request update parc: "+ this.selectedParc.key);

  var positionRef = firebase.database().ref('positions/' + this.selectedParc.key);
  positionRef.on("value", function(snapshot) {
    var parc = snapshot.val();
    this.selectedParc.parc= parc;

    this.parcName.value = this.selectedParc.parc.name;
    this.parcNameLabel.innerHTML = "";
    this.parcDescription.value = parc.description;
    this.parcDescriptionLabel.innerHTML = "";
    this.parcOpen.checked = this.selectedParc.parc.open;
    this.parcSwing.checked = this.selectedParc.parc.swing;
    if(!this.selectedParc.parc.open)
    {
      this.parcOpenLabel.removeClass('is-checked');
    }
    if(!this.selectedParc.parc.swing)
    {
      jQuery(document.getElementById('swingLabel')).removeClass('is-checked');
    }
    this.parcTrampoline.checked =this.selectedParc.parc.trampoline;
    if(!this.selectedParc.parc.trampoline)
    {
      jQuery(document.getElementById('trampolineLabel')).removeClass('is-checked');
    }
    this.parcSlide.checked = this.selectedParc.parc.slide;
    if(!this.selectedParc.parc.slide)
    {
      jQuery(document.getElementById('slideLabel')).removeClass('is-checked');
    }
    this.lessThan2years.checked = this.selectedParc.parc.lessThan2years;
    if(!this.selectedParc.parc.lessThan2years)
    {
      jQuery(document.getElementById('selectedParcLessThan2yearsLabel')).removeClass('is-checked');
    }
    this.between2and6.checked = this.selectedParc.parc.between2and6;
    this.sixandPlus.checked = this.selectedParc.parc.sixandPlus;

    this.closeDetails();
    this.displayParcForm();
  }.bind(this));
}

// Saves a new message on the Firebase DB.
FriendlyChat.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    // Add a new message entry to the Firebase Database.
    this.reviewsRef.push({
      name: currentUser.displayName,
      text: this.messageInput.value,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function() {
      // Clear message text field and SEND button state.
      FriendlyChat.resetMaterialTextfield(this.messageInput);
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Firebase Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Saves a new message containing an image URI in Firebase.
// This first saves the image in Firebase storage.
FriendlyChat.prototype.saveImageMessage = function(event) {
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  this.imageForm.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
    return;
  }

  // Check if the user is signed-in
  if (this.checkSignedInWithMessage()) {

    // We add a message with a loading icon that will get updated with the shared image.
    var currentUser = this.auth.currentUser;
    this.messagesRef.push({
      name: currentUser.displayName,
      imageUrl: FriendlyChat.LOADING_IMAGE_URL,
      photoUrl: currentUser.photoURL || '/images/profile_placeholder.png'
    }).then(function(data) {

      // Upload the image to Firebase Storage.
      var uploadTask = this.storage.ref(currentUser.uid + '/' + Date.now() + '/' + file.name)
      .put(file, {'contentType': file.type});
      // Listen for upload completion.
      uploadTask.on('state_changed', null, function(error) {
        console.error('There was an error uploading a file to Firebase Storage:', error);
      }, function() {

        // Get the file's Storage URI and update the chat message placeholder.
        var filePath = uploadTask.snapshot.metadata.fullPath;
        data.update({imageUrl: this.storage.ref(filePath).toString()});
      }.bind(this));
    }.bind(this));
  }
};

// Signs-in Friendly Chat.
FriendlyChat.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
FriendlyChat.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');


    this.updateParcButton.removeAttr('hidden');
    this.messageForm.removeAttribute('hidden');

    // We load currently existing chant messages.
    //this.loadMessages();
    //this.loadPositions();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');
    
    this.updateParcButton.setAttribute('hidden', 'true');
    this.messageForm.setAttribute('hidden', 'true');

    //this.loadPositions();
    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }

};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Template for messages.
FriendlyChat.MESSAGE_TEMPLATE =
'<div class="message-container">' +
'<div class="spacing"><div class="pic"></div></div>' +
'<div class="message"></div>' +
'<div class="name"></div>' +
'</div>';

// A loading image URL.
FriendlyChat.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

FriendlyChat.prototype.returnDetailsString = function(parc){
  var strings  = {
    "closed" : "",
    "swingString"  : "",
    "slideString"  : "",
    "trampolineString"  : "",
    "lessThan2yearsString" : "0-2 years",
    "between2and6String"  : "2-6 years",
    "sixandPlusString"  : ">6 years",
    "fillColor" : "#00CCBB"
  };

  if(!parc.open){
    strings.closed="CLOSED";
    strings.fillColor="#CCCCCC";
  }
  if(parc.swing){
    strings.swingString= "swing";
  }
  if(parc.slide){
    strings.slideString= "slide";
  }
  if(parc.trampoline){
    strings.trampolineString= "trampoline";
  }
  if(!parc.lessThan2years){
    strings.swingString= "";
  }
  if(!parc.between2and6){
    strings.between2and6String= "";
  }
  if(!parc.sixandPlus){
    strings.sixandPlusString= "";
  }

  return strings;
}

FriendlyChat.prototype.cleanParcsDisplayed = function(){
 for (var i=0; i<this.markers.length; i++){
  var li = document.getElementById("listItem"+this.markers[i].key);
  this.markers[i].setMap(null);
}
while (this.listParcsAround.firstChild) {
  this.listParcsAround.removeChild(this.listParcsAround.firstChild);
}
this.parcKeys=[];
this.markers =[];
this.markerCluster.clearMarkers();
this.markerCluster.redraw();
}
// Displays a park in the UI.
FriendlyChat.prototype.displayParkInfo = function(key, parc) {

  //console.log(">>playParkInfo");
  var newPosition = parc.position;
  var infowindow = new google.maps.InfoWindow();
  var latLng = new google.maps.LatLng(newPosition.lat, newPosition.lng);

  var detailStrings = this.returnDetailsString(parc);
  // Place a marker at that location.

  //color depends on the type of parc: 

  var icon ="http://maps.google.com/mapfiles/ms/icons/blue.png"; 

  if(parc.source !="community"){
    icon= "http://maps.google.com/mapfiles/ms/icons/green.png";
  }
  if(!parc.open){
    icon= "http://maps.google.com/mapfiles/ms/icons/grey.png";
  }
  var marker = new google.maps.Marker({
    position: latLng,
    map: this.map,
    title: parc.name,
    icon:icon,
    key: key,    
  });
  if(this.markers.indexOf(marker) === -1) {
    this.markers.push(marker);
    this.markerCluster.addMarker(marker, true);
  }   
  else{

  }
  var stringClosed="";
  if(!parc.open){
    stringClosed= "CLOSED ! ";
  }
  marker.addListener('mouseover', function() {
    infowindow.setContent('<div><strong>' 
      + parc.name + '</strong><br>' +
      '</div><div>'+
      stringClosed+ " "+
      detailStrings.swingString+ " "+
      detailStrings.slideString+ " "+
      detailStrings.trampolineString+
      '</div><div>'+
      detailStrings.lessThan2yearsString+ " | "+
      detailStrings.between2and6String+ " | "+
      detailStrings.sixandPlusString+
      '</div>');
    infowindow.open(map, this);

  });
  marker.addListener('mouseout', function() {
    infowindow.close();

  });
  marker.addListener('click', function() {
    this.selectedParc.key = key;
    this.selectedParc.parc = parc;
    this.setDetails(parc.name,parc.swing,parc.slide,parc.trampoline,parc.lessThan2years,
      parc.between2and6,parc.sixandPlus,parc.addedBy, parc.description,parc.pictureUrl);
    this.openSidePanel();
    this.displayParcDetails();
    this.loadReviews();

    
    if(open){
     parcDetailsClose.setAttribute("hidden",true);
   }
   else{
    parcDetailsClose.removeAttribute("hidden");
  }
  this.selectedParc.key = key;
  this.selectedParc.parc = parc;
}.bind(this));

  marker.addListener('rightclick', function() {
    console.log("Removing parc: "+key)
    this.positionRef.child(key).remove()
    this.geoFire.remove(key)
  }.bind(this));

}

FriendlyChat.prototype.setDetails = function(name,swing,slide,trampoline,lessThan2years,between2and6,sixandPlus,addedBy,description,pictureUrl){
  this.parcDetailsName.innerHTML = name;
  
  if(!lessThan2years){
    this.parcDetailsLittle.setAttribute("hidden",true);
  }
  else{
    this.parcDetailsLittle.removeAttribute("hidden");
  }
  if(!between2and6){
    this.parcDetailsMiddle.setAttribute("hidden",true);
  }
  else{
    this.parcDetailsMiddle.removeAttribute("hidden");
  }
  if(!sixandPlus){
    this.parcDetailsOld.setAttribute("hidden",true);
  }
  else{
    this.parcDetailsOld.removeAttribute("hidden");
  }
  if(!trampoline){
    this.trampolineImg.setAttribute("hidden",true);
  }
  else{
    this.trampolineImg.removeAttribute("hidden");
  }
  if(!swing){
    this.swingImg.setAttribute("hidden",true);
  }
  else{
    this.swingImg.removeAttribute("hidden");
  }
  if(!slide){
    this.slideImg.setAttribute("hidden",true);
  }
  else{
    this.slideImg.removeAttribute("hidden");
  }
  this.parcDetailsAddedBy.innerHTML = "Added by: "+ addedBy;
  this.parcDetailsDescription.innerHTML = description;
  if(pictureUrl && pictureUrl!=""){
    this.parcDetailspictureIMG.src=pictureUrl;
    this.parcDetailspictureIMG.removeAttribute('hidden');
  }
  else{
    this.parcDetailspictureIMG.setAttribute('hidden',true);
  }
}

//display right panel parc details
FriendlyChat.prototype.openSidePanel = function(){
  this.parcDetailsContainer.removeAttribute('hidden');
  jQuery(this.parcDetailsContainer).addClass('mdl-cell--4-col');
  jQuery(this.parcDetailsContainer).removeClass('mdl-cell--0-col');
  jQuery(this.mapContainer).addClass("mdl-cell--6-col" );
  jQuery(this.mapContainer).removeClass("mdl-cell--10-col" );
  jQuery('html, body').animate({
    scrollTop: jQuery(this.parcDetailsContainer).offset().top
  }, 2000);
}
//display right panel parc details
FriendlyChat.prototype.closeSidePanel = function(){
  this.parcDetailsContainer.setAttribute('hidden',true);
  jQuery(this.mapContainer).addClass("mdl-cell--10-col" );
  jQuery(this.mapContainer).removeClass("mdl-cell--6-col" );
  jQuery(this.parcDetailsContainer).addClass('mdl-cell--0-col');
  jQuery(this.parcDetailsContainer).removeClass('mdl-cell--4-col');
}

FriendlyChat.prototype.cleanReview = function(){
  while(this.messageList.firstChild){
    this.messageList.removeChild(this.messageList.firstChild);
  }
}
// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, name, text, picUrl, imageUri) {
  var div = document.getElementById(key);
  // If an element for that message does not exists yet we create it.
  if (!div) {
    var container = document.createElement('div');
    container.innerHTML = FriendlyChat.MESSAGE_TEMPLATE;
    div = container.firstChild;
    div.setAttribute('id', key);
    this.messageList.appendChild(div);
  }
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + picUrl + ')';
  }
  div.querySelector('.name').textContent = name;
  var messageElement = div.querySelector('.message');
  if (text) { // If the message is text.
    messageElement.textContent = text;
    // Replace all line breaks by <br>.
    messageElement.innerHTML = messageElement.innerHTML.replace(/\n/g, '<br>');
  } else if (imageUri) { // If the message is an image. 
    var image = document.createElement('img');
    image.addEventListener('load', function() {
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }.bind(this));
    this.setImageUrl(imageUri, image);
    messageElement.innerHTML = '';
    messageElement.appendChild(image);
  }
  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  this.messageList.scrollTop = this.messageList.scrollHeight;
  this.messageInput.focus();
};

// Enables or disables the submit button depending on the values of the input
// fields.
FriendlyChat.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
      'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
      'actually a Firebase bug that occurs rarely. ' +
      'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
      'and make sure the storageBucket attribute is not empty. ' +
      'You may also need to visit the Storage tab alsond paste the name of your bucket which is ' +
      'displayed there.');
  }
};

$(document).ready(function(){

  window.friendlyChat = new FriendlyChat();
});
