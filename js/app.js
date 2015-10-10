"use strict";
//initialize the Map
	var mapProp = {
		center:new google.maps.LatLng(38.748381,-89.983158),
		zoom:10,
		mapTypeId:google.maps.MapTypeId.ROADMAP
	};
	var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

// The Model - data.

var initialLocations = [
{
		name: 'Glen Carbon, Il',
		category: 'city',
		marker:  new google.maps.Marker({
			position: new google.maps.LatLng(38.748381, -89.983158),
			animation: google.maps.Animation.DROP,
			title: 'Glen Carbon',
			icon: 'images/city.png'
			})
	},
	{
		name: 'Edwardsville, IL',
		category: 'city',
		marker: new google.maps.Marker({
			position: new google.maps.LatLng(38.811436,-89.953157),
			animation: google.maps.Animation.DROP,
			title: 'Edwardsville',
			icon: 'images/city.png'
			})
	},
	{
		name: 'Granite City, IL',
		category: 'city',
		marker: new google.maps.Marker({
			position: new google.maps.LatLng(38.701439,-90.148720),
			animation: google.maps.Animation.DROP,
			title: 'Granite City',
			icon: 'images/city.png'
			})
	},
	{
		name: 'Maryville, IL',
		category: 'city',
		marker: new google.maps.Marker({
			position: new google.maps.LatLng(38.724500,-89.957244),
			animation: google.maps.Animation.DROP,
			title: 'Maryville',
			icon: 'images/city.png'
			})
	},
	{
		name: 'Troy, IL',
		category: 'city',
		marker: new google.maps.Marker({
			position: new google.maps.LatLng(38.729215,-89.883154),
			animation: google.maps.Animation.DROP,
			title: 'Troy',
			icon: 'images/city.png'
			})
	},
	{
		name: 'Highland, IL',
		category: 'city',
		marker: new google.maps.Marker({
			position: new google.maps.LatLng(38.739492,-89.671201),
			animation: google.maps.Animation.DROP,
			title: 'Highland',
			icon: 'images/city.png'
			})
	},
	{
		name: 'Collinsville, IL',
		category: 'city',
		marker: new google.maps.Marker({
			position: new google.maps.LatLng(38.670327,-89.984548),
			animation: google.maps.Animation.DROP,
			title: 'Collinsville',
			icon: 'images/city.png'
			})
	}];

//Data stored for each Location in the observableArray
var Location =  function(data) {
	var self = this;
	self.name = ko.observable(data.name);
	self.category = ko.observable(data.category);
	self.marker = data.marker;
};

//The View Model
var ViewModel = function() {

	var self = this;

	//info window to display for each marker
	var infoWindow = new google.maps.InfoWindow({
			content: "",
			maxWidth: 400
		});

	self.locationList = ko.observableArray([]);

	initialLocations.forEach(function(locationItem){
		var curItem = new Location(locationItem);
		self.locationList.push(curItem);
		google.maps.event.addListener(curItem.marker, 'click', function() {
			displayInfoWindow(map, curItem.marker, curItem.name(), infoWindow);
		});
	});

	//Location user clicked on
	self.currentLocation = ko.observable( self.locationList()[0] );

	// Sets the current location when it is clicked on
	this.setLocation = function (clickedLocation){
		self.currentLocation(clickedLocation);
		displayInfoWindow(map, clickedLocation.marker, clickedLocation.name(), infoWindow);
	};

	//Filter is used to limit the items displayed to what maches the search criteria entered by the user
	//in the search box.
	self.filter = ko.observable("");

	this.filteredItems = ko.computed(function () {
		var filter = self.filter().toLowerCase();
		if (!filter){
			for (var index = 0; index < self.locationList().length; index++)
			{
				var mark = self.locationList()[index].marker;
				mark.setMap(map);
			}
			return self.locationList();
		}
		else {
			return ko.utils.arrayFilter(self.locationList(), function (item) {
				var mark = item.marker;
				if(item.name().toLowerCase().indexOf(filter) == -1) {
					mark.setMap(null);
					}
					else {
					mark.setMap(map);
				}
				return item.name().toLowerCase().indexOf(filter) !== -1;
			});
		}
	}, ViewModel);
};

ko.applyBindings(new ViewModel());

//This function will update the content of a info window and set the map marker to bounce and pan the
//map to the marker
function displayInfoWindow(map,marker, city, infoWindow){
	var contentTitle = "<div> " + city + "</div>";
	infoWindow.setContent(contentTitle);
	map.panTo(marker.position);
	toggleBounce(marker);

	window.setTimeout(function() {
		toggleBounce(marker);
	},3000);

 //get wikipedia information asynchronously
	var wikiRequestTimeout = setTimeout(function() {
			infoWindow.setContent (contentTitle + "<div>Failed to get wikipedia resources for " + city + "</div>");
		}, 1000);

		var wikiUrl = 'http://en.wikipediawikipediawikipedia.org/w/api.php?action=opensearch&search=' + city + '&format=json&callback=wikiCallback';
		$.ajax( {
				url: wikiUrl,
				dataType: "jsonp",
				success: function(response) {
					var articleList = response[1];
					var contentString = contentTitle;
					for (var i=0; i<articleList.length;i++)
					{
						var articleString = articleList[i];
						var url = 'http://en.wikipedia.org/wiki/' + articleString;
						contentString += '<li><a href="' + url + '" target="_blank">' + articleString + '</a></li>';
					}

					clearTimeout(wikiRequestTimeout);
					infoWindow.setContent (contentString);
				}
		});

	 infoWindow.open(map, marker);
}

function toggleBounce(marker) {
	if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}
}

function errorMap(){
$("#googleMap").append('<div> <h2> "Failed to get google map, Please try again later </h2> </div>');
}

// Menu Toggle Script
		$("#menu-toggle").click(function(e) {
				e.preventDefault();
				$("#wrapper").toggleClass("toggled");
		});
