//Create intial places array
intialPlaces = [
{
    name: 'Anthonys Coal Fired Pizza',
    address: '2203 S Federal Hwy',
    city: 'Fort Lauderdale',
    state: 'Florida',
    zip: '33316',
    cat: 'Food',
    showPlace: true,
    id: '',
    photo: '',
    ratingPhoto: '',
    ratingNum: '',
    lat: 26.094444,
    lng: -80.136955
},
{
    name: 'Deep Blue Divers',
    address: '4348 N Ocean Dr',
    city: 'Fort Lauderdale',
    state: 'Florida',
    zip: '33308',
    cat: 'Entertainment',
    showPlace: true,
    id: '',
    photo: '',
    ratingPhoto: '',
    ratingNum: '',
    lat: 26.181631,
    lng: -80.097566
},
{
    name: 'Coconuts',
    address: '429 Seabreeze Blvd',
    city: 'Fort Lauderdale',
    state: 'Florida',
    zip: '33316',
    cat: 'Food',
    showPlace: true,
    id: '',
    photo: '',
    ratingPhoto: '',
    ratingNum: '',
    lat: 26.117258,
    lng: -80.106027
},
{
    name: 'Everglades Holiday Park',
    address: '21940 Griffin Rd',
    city: 'Fort Lauderdale',
    state: 'Florida',
    zip: '33332',
    cat: 'Entertainment',
    showPlace: true,
    id: '',
    photo: '',
    ratingPhoto: '',
    ratingNum: '',
    lat: 26.060451,
    lng: -80.444622
}]

var place = function(data) {
  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
  this.city = ko.observable(data.city);
  this.state = ko.observable(data.state);
  this.zip = ko.observable(data.zip);
  this.cat = ko.observable(data.cat);
  this.showPlace = ko.observable(data.showPlace);
  this.lat = ko.observable(data.lat);
  this.lng = ko.observable(data.lng);
}

function ViewModel() {
  var that = this;

  //My Favorite Location variables
  this.favCity = ko.observable('Fort Lauderdale');
  this.favState = ko.observable('Florida');
  this.favLat = ko.observable(26.1219444);
  this.favLng = ko.observable(-80.1436111);

  //Create arrays
  this.placeList = ko.observableArray([]); //array for all places to visit
  this.markers = ko.observableArray([]);  //array of map markers

  //Load all initalPlaces into placeList
  intialPlaces.forEach(function(placeItems){
    that.placeList.push(new place(placeItems));
  });

  //Intialize Google Map LatLng for Fort Lauderdale Florida
  var map;
  function initialize() {
    var mapProp = {
      center:new google.maps.LatLng(that.favLat(),that.favLng()),
      zoom:11,
      mapTypeId:google.maps.MapTypeId.ROADMAP,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_CENTER,
        style: google.maps.ZoomControlStyle.LARGE
      },
      streetViewControlOptions: {
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      mapTypeControl: false,
      panControl: false
    };

    map=new google.maps.Map(document.getElementById("googleMap"),mapProp);

    //Create markers, add id number for gotoMarker function, prepare
    //yelp data for marker infoWindow and place marker on map.
    for(var i = 0; i < that.placeList().length;i++) {
      var marker = new google.maps.Marker({
        position: {lat: that.placeList()[i].lat(), lng: that.placeList()[i].lng()}, 
        title: that.placeList()[i].name(),
        draggable: false,
        map: map
      });
      that.placeList()[i].id = i;
      getYelp(that.placeList()[i]);
      that.markers()[i]=marker;        
    };

  };

  //Initilialize map on load
  google.maps.event.addDomListener(window, 'load', initialize);

  //Go to clicked marker by changing zoom value and panTo location.
  this.goToMarker = function(clickedPlace) {
    map.panTo(that.markers()[clickedPlace.id].position);
    map.setZoom(14);

    //set content for info window pop up
    var content = '<div>'+
      '<h1>' + clickedPlace.name() + '</h1>'+
      '<img src=' + clickedPlace.photo + ' alt="Main Image">' +
      '<h3>' + clickedPlace.ratingNum + ' stars is the average Yelp rating.</h3>' +
      '<img src=' + clickedPlace.ratingPhoto + ' alt="rating image">' +
      '</div>';
    var infowindow = new google.maps.InfoWindow();
    infowindow.setContent(content);
    infowindow.open(map, that.markers()[clickedPlace.id]);
    map.panBy(0, -150);
  };

  //filter the list by changing the showPLace to false depending on radio button selected
  filterList = function() {
    for(var i=0; i < that.placeList().length; i++) {
      if(document.getElementById('choice-2').checked && that.placeList()[i].cat() != 'Food') {
        that.placeList()[i].showPlace = false;
      } else if(document.getElementById('choice-3').checked && that.placeList()[i].cat() != 'Entertainment'){
        that.placeList()[i].showPlace = false;
      } else {
        that.placeList()[i].showPlace = true;
      }
    };
    //need to change observable for list foreach to re-run
    that.placeList.push("");
    that.placeList.pop(); 
  };
  
  //function to return showPlace value state after user has made a selection.
  showList = function(index) {
    return (that.placeList()[index()].showPlace);
  };

// Use API to get data and store the info.
  function getYelp(place) {
    var ywsid = '&ywsid=LTobyR3uHwSIrfnFIT4E8g';
    var yelpUrl = "http://api.yelp.com/business_review_search?&limit=1&lat=" + place.lat() + "&long=" + place.lng() + "&term=" + place.name() + "&limit=1" + ywsid;
    $.ajax({
      url: yelpUrl,
      async: false,
      dataType: 'jsonp',
      success: function(data) {
        that.placeList()[place.id].photo = data.businesses[0].photo_url;
        that.placeList()[place.id].ratingPhoto = data.businesses[0].rating_img_url;
        that.placeList()[place.id].ratingNum = data.businesses[0].avg_rating;
      },
      error: function() {
        console.log("Error getting Yelp data!")
      }
    });
  };

}

ko.applyBindings(new ViewModel());

