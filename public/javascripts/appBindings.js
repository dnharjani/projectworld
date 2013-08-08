var AppModel = function(){
    var self = this;
    self.currentPanel = ko.observable('map');

    self.isCurrentPanel = function(panelName){
        return self.currentPanel() === panelName;
    };

//    self.switchToHomePanel = function(){
//        self.currentPanel('home');
//    };
//
//    self.switchToChartsPanel = function(){
//        self.currentPanel('charts');
//    };
//
//    self.switchToEventsPanel = function(){
//        self.currentPanel('events');
//    };

    /** Map Panel **/
    self.mapInitialized = false;
    self.boardingPassPanelVisible = ko.observable(false);

    self.switchToMapPanel = function(){
        self.currentPanel('map');
        // Remove all old flightPaths
        for(var j=0; j< self.flightPaths.length; j++){
            self.flightPaths[j].setMap(null);
        }
        self.flightPaths = [];

        if(!self.mapInitialized){
            friendsMap = initializeMap('map-panel');
            $(document).trigger('locationsUpdated');
            self.mapInitialized = true;
        }
    };

    // Boarding Pass popup
    self.showBoardingPassPanel = function(){
        self.boardingPassPanelVisible(true);
        $('.boarding-pass .locations-autocomplete').typeahead({
            source: locations
        });
    };

    self.hideBoardingPassPanel = function(){
        self.boardingPassPanelVisible(false);
    };

    /** Trips Panel **/
    self.flights = ko.observableArray();
    self.currentFlight = ko.observable({
        from: '',
        to: '',
        leaving: '',
        arriving: ''
    });
    self.flightPaths = [];

    self.switchToTripsPanel = function(){
        self.currentPanel('trips');

        // Datepicker with disabled dates
        var nowTemp = new Date();
        var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);

        var arriving = $('.from-date').datepicker({
            onRender: function(date) {
                return date.valueOf() < now.valueOf() ? 'disabled' : '';
            }
        }).on('changeDate', function(ev) {
                if (ev.date.valueOf() > leaving.date.valueOf()) {
                    var newDate = new Date(ev.date);
                    newDate.setDate(newDate.getDate() + 1);
                    leaving.setValue(newDate);
                }
                arriving.hide();
                $('#to-date')[0].focus();
            }).data('datepicker');

//        var leaving = $('#to-date').datepicker({
//            onRender: function(date) {
//                return date.valueOf() <= arriving.date.valueOf() ? 'disabled' : '';
//            }
//        }).on('changeDate', function(ev) {
//                leaving.hide();
//            }).data('datepicker');


        $('.boarding-pass .locations-autocomplete').typeahead({
            source: locations
        });
    };

    self.updateToLocation = function(toLocation){
        self.currentFlight({
            from: self.currentFlight().from,
            to: toLocation,
            leaving: '',
            arriving: ''
        });
        self.showBoardingPassPanel();
        $('#friends-modal').modal('hide');
    };

    self.addFlight = function() {
        var leavingDate =  $('#to-date');
        var arrivingDate =  $('#from-date');

        self.currentFlight({
            from: self.currentFlight().from,
            to: self.currentFlight().to,
            leaving: leavingDate.val(),
            arriving: arrivingDate.val()
        });

        self.flights.push(self.currentFlight());

        self.currentFlight({
            from: self.currentFlight().to,
            to: '',
            leaving: '',
            arriving: ''
        });

        arrivingDate.val('');
        leavingDate.val('');

        self.filterMapByFlights();

        self.boardingPassPanelVisible(false);
    };

    self.removeFlight = function(flight) {
        self.flights.remove(flight);
        self.filterMapByFlights();
    };

    self.showFriendMarkers = function(){
        showAllFriendMarkers();
        for(var i= 0; i < tripMarkers.length; i++){
            hideFriendMarkerAtLocation(tripMarkers[i].location);
        }
    };

    self.hideFriendMarkers = function(){
        hideAllFriendMarkers();
    };

    self.filterMapByFriends = function() {
        removeAllTripMarkers();
        for(var j=0; j< self.flightPaths.length; j++){
            self.flightPaths[j].setMap(null);
        }
        showAllFriendMarkers();
    };

    self.filterMapByFlights = function() {
        removeAllTripMarkers();

        // Remove all old flightPaths
        for(var j=0; j< self.flightPaths.length; j++){
            self.flightPaths[j].setMap(null);
        }
        self.flightPaths = [];

        zoomMapOut();

        if(self.flights().length > 0){
            hideAllFriendMarkers();
            for(var i= 0; i < self.flights().length; i++){
                var locationTo = $.grep(locationsWithLatLng, function(e){return e.name === self.flights()[i].to});
                var locationFrom = $.grep(locationsWithLatLng, function(e){return e.name === self.flights()[i].from});

                if(locationTo[0] !== undefined){
                    createTripMarker(locationTo[0], getFbFriendsAroundLocation(locationTo[0].name, 25000), friendsMap);
                }
                else{
                    geocodeLocation(self.flights()[i].to);
                }

                if(locationFrom[0] !== undefined){
                    createTripMarker(locationFrom[0], getFbFriendsAroundLocation(locationFrom[0].name, 25000), friendsMap);
                }
                else{
                    geocodeLocation(self.flights()[i].from);
                }

                if(locationTo[0] !== undefined && locationFrom[0] !== undefined){
                    var pointFrom = new google.maps.LatLng(locationTo[0].lat, locationTo[0].lng);
                    var pointTo = new google.maps.LatLng(locationFrom[0].lat ,locationFrom[0].lng);
                    var flightPath = new google.maps.Polyline({
                        path: [pointFrom, pointTo],
                        strokeColor: "#FF0000",
                        strokeOpacity: 1.0,
                        strokeWeight: 2,
                        geodesic: true
                    });
                    flightPath.setMap(friendsMap);
                    self.flightPaths.push(flightPath);
                }
            }
        }
        else{
            showAllFriendMarkers();
        }
    };
    /** End Trips Panel **/

    /** Notifications Modal**/
    self.showNotifications = function(){
        $('#notifications-modal').modal('show');
    };

    self.openModalAtLocation = function(location){
        $('#notifications-modal').modal('hide');
        new google.maps.event.trigger( getFriendMarkerAtLocation(location), 'click' );
    };

    /** Unknown Friend Locations Modal **/
    self.showUnknownFriendsModal = function(){
        $('#unknowm-location-modal').modal('show');
    };

    /** Country sorted list Modal**/
   self.showFriendsPerCountryModal = function(){
       $('#friends-per-country-modal').modal('show');
   }
};


//function showMarkersCloseToLocation( locationLatLng, maxDistance){
//    for(var k =0; k < friendMarkers.length; k++){
//        if(google.maps.geometry.spherical.computeDistanceBetween (friendMarkers[k].position, locationLatLng) < maxDistance){
//            friendMarkers[k].setVisible(true);
//        }
//    }
//}

function buildAirportSearchQuery(term) {
    return "select * from json where url = 'http://airportcode.riobard.com/search?fmt=JSON&q=" + term + "'";
}

ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value));
    },
    update: function(element, valueAccessor) {
        var value = valueAccessor();
        ko.utils.unwrapObservable(value) ? $(element).fadeIn() : $(element).hide();
    }
};

var appModel = new AppModel();
ko.applyBindings(appModel);
