/*Model for App*/
//locations, lat,lng positions and their foursquare id's
var Locations = [
		{name: "Caesars", position: {lat: 42.320129, lng: -83.033505}, id: "4c08dff81244b713ad16a872"},
		{name: "Adventure Bay", position: {lat: 42.317171, lng: -83.044282}, id: "51e87c44498e9bde2783ecd8"},
		{name: "Motor Burger", position: {lat: 42.313609, lng: -83.021074}, id: "4b685326f964a520c8712be3"},
		{name: "Bulls Eye Pizza West", position: {lat: 42.296491, lng: -83.045361}, id: "4e729743ae60854eea45ae06"},
		{name: "Olde Walkerville Theater", position: {lat: 42.321696, lng: -83.016538}, id: "525aea2811d2900fb5661e90"}
];
//global variables to use in google map
var map;
var largeInfoWindow;
//Function rendering the map on screen
	function initMap() {
// Create a styles array to use with the map
        var styles = [
          {
            featureType: 'water',
            stylers: [
              { color: '#19a0d8' }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.stroke',
            stylers: [
              { color: '#ffffff' },
              { weight: 6 }
            ]
          },{
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [
              { color: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -40 }
            ]
          },{
            featureType: 'transit.station',
            stylers: [
              { weight: 9 },
              { hue: '#e85113' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'labels.icon',
            stylers: [
              { visibility: 'off' }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [
              { lightness: 100 }
            ]
          },{
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [
              { lightness: -100 }
            ]
          },{
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [
              { visibility: 'on' },
              { color: '#f0e4d3' }
            ]
          },{
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [
              { color: '#efe9e4' },
              { lightness: -25 }
            ]
          }
        ];
//Google map elements
		map = new google.maps.Map(document.getElementById("map"), {
			center: {lat: 42.314937, lng: -83.036363},
			zoom: 13,
			styles: styles,
			mapTypeControl: false
		});
	}
//infowindow content
	function contentString(location) {
		return ('<h1 id="firstHeading" class="firstHeading">' + location.name + '</h1>'
            + '<div id="bodyContent">'+ '<p>' + location.formattedAddress[0] + '<br>'
            + location.formattedAddress[1] +  '<br>' + location.shortUrl +   '</p>'+ '</div>');
	}

        /*****viewmodel for app*****/
function ViewModel() {
	var self = this;
	self.markers = [];
/*get the Locations from model & stores them in an observable array
     for knockout listview*/
	self.Locations = ko.observableArray(Locations);
//creating markers in Locations Array
	self.Locations().forEach(function(location) {
//marker parameters
		var marker = new google.maps.Marker({
			icon: 'image/location_icon.png',
			map: map,
			title: location.name,
            position: location.position,
			animation: google.maps.Animation.DROP
		});
		location.marker = marker;
		marker.setVisible(true);
	//Pushes each marker into the markers array
		self.markers.push(marker);
        //Click on Location name in list view
    self.listViewClick = function(location) {
        if (location.name) {
            map.setZoom(14);
            // Pans the map view to selected marker when list view Location is clicked
            map.panTo(location.position);
            location.marker.setAnimation(google.maps.Animation.BOUNCE); // Bounces marker when list view Location is clicked
             if (largeInfoWindow !== undefined) {
                                largeInfoWindow.close();
                            }
                            largeInfoWindow = location.infoWindow;
                            // Opens an info window on selected location name marker
                            largeInfoWindow.open(map, location.marker);
                        }
                        setTimeout(function() {
                        location.marker.setAnimation(null);
        }, 2000); // marker bounce for 2 sec and then stop.
    };
/******using foursquare as third party API*****/
//declaring id and secret for foursquare api
		var CLIENT_ID_Foursquare = '?client_id=UHUKVAGXPZDA2BFEAQSULCCKQPGBYEIBAPEUARN0J3WD5OOY';
		var CLIENT_SECRET_Foursquare = '&client_secret=J2BKMB5K1FSD0Q0G23KEICXNPGOFKS1H0FFB000NOTY001YR';
//Foursquare api ajax request
			$.ajax({
                type: "GET",
				dataType: 'json',
				cache: false,
				url: 'https://api.foursquare.com/v2/venues/' + location.id + CLIENT_ID_Foursquare + CLIENT_SECRET_Foursquare + '&v=20170524',
				async: true,
                success: function(data) {
                    console.log(data.response);
                    console.log(data.response.venue.name);
					console.log(data.response.venue.location.formattedAddress);
					console.log(data.response.venue.shortUrl);
//bind infowindows to Location in the markers array
var infoWindow = new google.maps.InfoWindow({
    content: contentString({name: data.response.venue.name,
     formattedAddress: data.response.venue.location.formattedAddress,
      shortUrl:data.response.venue.shortUrl})
});
location.infoWindow = infoWindow;
location.marker.addListener('click', function () {
    if (largeInfoWindow !== undefined) {
        largeInfoWindow.close();
	}
    largeInfoWindow = location.infoWindow;
    location.infoWindow.open(map, this);
    //adding bouncing effect to markers
    location.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function () {
    location.marker.setAnimation(null);
},
2000); //markers will bounce for 2 seconds and then stop
});
},
//an alert window will notify the user of the error
error: function(data) {
	alert("Something is wrong. Unable to load data from foursquare.");
}
});
});
	// Stores user input
	self.query = ko.observable('');
//Filter through observableArray and filter results using knockouts utils.arrayFilter();
self.search = ko.computed(function () {
	return ko.utils.arrayFilter(self.Locations(), function (listResult) {
	var result = listResult.name.toLowerCase().indexOf(self.query().toLowerCase());

//If-else statement used to display markers after meeting search criterion
	if (result === -1) {
		listResult.marker.setVisible(false);
		} else {
		listResult.marker.setVisible(true);
		}
		return result >= 0;
		});
	});
}
//enabling knockout js and renders app on screen
function initApp() {
				initMap();
				ko.applyBindings(new ViewModel());
}