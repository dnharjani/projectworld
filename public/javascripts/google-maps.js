// Todo make this into a module

var locationsWithLatLng = [],
    locations = [],
    friendMarkers = [],
    tripMarkers = [],
    notifications = [],
    friendsWithUnknownLocation = [],
    defaultCenter = new google.maps.LatLng(31.897909,-5.593039),
    defaultZoom = 2,
    friendsMap;


function initializeMap(elementId) {
    var mapOptions = {
        center: defaultCenter,
        zoom: defaultZoom,
        minZoom : 2,
        maxZoom : 12,
        draggable: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false,
        mapTypeControl: false
    };
    return new google.maps.Map(document.getElementById(elementId), mapOptions);
}

// Do the ajax calls to geocode friends' locations
$(document).on('updatedFriendLocations', function(){
    var ajaxCalls = 0, ajaxReturns = 0;

    var localStorageLocations = localStorage.getItem('pw-'+me.id+'-locations');
    if(localStorageLocations !== null){
        locationsWithLatLng = JSON.parse(localStorageLocations);
        for(var j=0; j<locationsWithLatLng.length; j++){
            locations.push(locationsWithLatLng[j].name);
        }
    }

    for(var i=0; i<fbFriends.length; i++){
        if(fbFriends[i].location !== undefined && fbFriends[i].location.name !== null && $.inArray(fbFriends[i].location.name, locations) === -1){
            locations.push(fbFriends[i].location.name);
            $.ajax({
                url: 'http://api.geonames.org/searchJSON?',
                dataType: 'jsonp',
                data: {
                    userName : 'dnharjani',
                    q : fbFriends[i].location.name
                },
                locationName : fbFriends[i].location.name,
                beforeSend : function(){
                    ajaxCalls++;
                },
                complete: function(){
                    ajaxReturns++;
                    if(ajaxCalls === ajaxReturns){
                        $(document).trigger('locationsUpdated');
                    }
                },
                success: function(result){
                    if(result.totalResultsCount > 0){
                        var location = this.locationName;
                        locationsWithLatLng.push({name : location, countryName : result.geonames[0].countryName, lat : result.geonames[0].lat, lng : result.geonames[0].lng});
                    }
                },
                error: function (xhr, textStatus) {
                    // unknown location?
                }
            });
        }
        else if(fbFriends[i].location === undefined || fbFriends[i].location.name === null) {
            friendsWithUnknownLocation.push(fbFriends[i]);
        }
    }

    createListOfUnknownFriendsLocations(friendsWithUnknownLocation);
    createListofFriendsPerCountry(locationsWithLatLng);
});

// Check for friends moving notifications
$(document).on('updatedFriendLocations', function(){
    var localStorageFriends = localStorage.getItem('pw-'+me.id+'-friends');
    var storedFriends = [];
    if(localStorageFriends != null){
        storedFriends = JSON.parse(localStorageFriends);
    }

    // todo rewrite to use grep?
    for(var i=0; i<fbFriends.length; i++){
        var friendFound = false;
        for(var j=0; j<storedFriends.length; j++){
            if(fbFriends[i].id === storedFriends[j].id){
                friendFound = true;
                if(fbFriends[i].location !== undefined && fbFriends[i].location.name !== null){
                    if(storedFriends[j].location !== undefined && storedFriends[j].location.name !== null){
                        if(fbFriends[i].location.name !== storedFriends[j].location.name){
                            notifications.push({type : 'locationChanged', friendId : fbFriends[i].id, friendName : fbFriends[i].name, oldLocation : storedFriends[j].location.name, newLocation : fbFriends[i].location.name });
                        }
                    }
                    else{
                        // Friend has set their location
                        notifications.push({type : 'locationChanged', friendId : fbFriends[i].id, friendName : fbFriends[i].name, oldLocation : 'none', newLocation : fbFriends[i].location.name });
                    }
                }
            }
        }

        // New Friend
        if(!friendFound && fbFriends[i].location !== undefined && fbFriends[i].location.name !== null){
            notifications.push({type : 'newFriend', friendId : fbFriends[i].id, friendName : fbFriends[i].name, oldLocation : 'none', newLocation : fbFriends[i].location.name });
        }
    }
    localStorage.setItem('pw-'+me.id+'-friends', JSON.stringify(fbFriends));
    $(document).trigger('notificationsUpdated');
});

// Geocode my location and initialize the friendsMap
$(document).on('updatedMyInformation', function(event){
    friendsMap = initializeMap('map-panel');

    if(me.location !== undefined && me.location.name !== null) {
        $.ajax({
            url: 'http://api.geonames.org/searchJSON?',
            dataType: 'jsonp',
            data: {
                userName : 'dnharjani',
                q : me.location.name
            },
            success: function(result){
                if(result.totalResultsCount > 0){
                    me.location.lat = result.geonames[0].lat;
                    me.location.lng = result.geonames[0].lng;
                }
            },
            error: function (xhr, textStatus) {
                console.log(textStatus);
            }
        });
    }
});

// Check when the locations are geocoded to put the markers on the friendsMap
$(document).on('locationsUpdated', function(event){
    var loadingAnimation = $('#loading-animation');
    loadingAnimation.show();
    localStorage.setItem('pw-'+me.id+'-locations', JSON.stringify(locationsWithLatLng));
    for(var i= 0; i<locationsWithLatLng.length;i++){
        var friendsByLocation = getFbFriendsAtLocation(locationsWithLatLng[i].name);
        if(friendsByLocation.length > 0){
            locationsWithLatLng[i].amountOfFriends = friendsByLocation.length;
            createFriendMarker(locationsWithLatLng[i], friendsByLocation, friendsMap);
        }
    }
    loadingAnimation.hide();
});

// Check when notification updating is done so that we can add them to the list
$(document).on('notificationsUpdated', function(){
    var notificationListElement = $('#notifications-list');

    var localStorageNotifications = localStorage.getItem('pw-'+me.id+'-notifications');
    var oldNotifications = [];
    if(localStorageNotifications != null){
        oldNotifications = JSON.parse(localStorageNotifications);
    }

    oldNotifications = oldNotifications.concat(notifications);
    localStorage.setItem('pw-'+me.id+'-notifications', JSON.stringify(oldNotifications));

    oldNotifications = oldNotifications.reverse();
    for(var j=0; j < oldNotifications.length; j++){
        // TODO remove 'illegal' characters much earlier
        // this is just a quick hack to remove illegal tokens
        var newLocation =  oldNotifications[j].newLocation;
        if(newLocation.indexOf ("'") === -1){
            notificationListElement.append($('<li><a data-bind="click: function(data, event) {openModalAtLocation(\''+newLocation+'\')}">'+oldNotifications[j].friendName+' moved to <strong>'+newLocation+'</strong></a></li>'))
        }
    }

    ko.applyBindings(appModel, document.getElementById('notifications-modal'));

});

function createFriendMarker(location, friendsByLocation, map){

    var markerIcon;

    if(friendsByLocation.length >= 50){
        markerIcon = 'group-black.png';
    }
    else if(friendsByLocation.length >= 25){
        markerIcon = 'group-blue.png';
    }
    else if(friendsByLocation.length >= 10){
        markerIcon = 'group-green.png';
    }
    else if(friendsByLocation.length >= 5){
        markerIcon = 'group-yellow.png';
    }
    else{
        markerIcon = 'group-red.png';
    }

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.lat, location.lng),
        location : location.name,
        icon: assetUrl+'/img/markers/'+markerIcon,
        map: map
    });
    google.maps.event.addListener(marker, 'click', function() {
        var friendElement = $('#friends-modal');

        friendElement.html('<h3>Friends in: '+marker.location+' ('+friendsByLocation.length+') </h3>');
        friendElement.append('<div id="button-container" class="clearfix">' +
            '<a href="#" id="select-all" class="icon-ok-sign icon-2x has-tooltip" data-toggle="tooltip" data-original-title="Select All" data-placement="top" data-trigger="hover"></a>' +
            '<a href="#" id="deselect-all" class="icon-ok-circle icon-2x has-tooltip" data-toggle="tooltip" data-original-title="Deselect All" data-placement="top" data-trigger="hover"></a>' +
            '<a href="#" id="message-selected" class="icon-envelope-alt icon-2x has-tooltip" data-toggle="tooltip" data-original-title="Message Selected" data-placement="top" data-trigger="hover"></a>' +
            '<a href="#" id="fly-to" class="icon-plane icon-2x has-tooltip" data-toggle="tooltip" data-original-title="Fly to here" data-placement="bottom" data-trigger="top" data-bind="click: function(data, event) { updateToLocation(\''+location.name+'\')}"></a></div>');
        friendElement.append('<ul class="friends-list clearfix"></ul>');
        for(var i=0; i< friendsByLocation.length; i++){
            $('#friends-modal .friends-list').append('<li class="unselected"><img width=56 height=56 src="https://graph.facebook.com/'+friendsByLocation[i].id+'/picture" /><div class="friend-information"><span>'+friendsByLocation[i].name+'</span><a class="icon-facebook-sign" target="_blank" href="https://facebook.com/'+friendsByLocation[i].id+'/"></a></div></li>');
        }
        friendElement.modal({show: true, backdrop: true});
        $('#friends-modal .has-tooltip').tooltip();
        ko.applyBindings(appModel, document.getElementById('friends-modal'));
    });
    friendMarkers.push(marker);
}

function createTripMarker(location, friendsByLocation, map){
    var markerIcon = 'pushpin-red.png';

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(location.lat, location.lng),
        location : location.name,
        icon: assetUrl+'/img/markers/'+markerIcon,
        map: map
    });
    google.maps.event.addListener(marker, 'click', function() {
        var friendElement = $('#friends-modal');
        friendElement.html('<h3>Friends within 25km of: '+marker.location+' ('+friendsByLocation.length+') </h3>');
        friendElement.append('<div id="button-container" class="clearfix">' +
            '<a href="#" id="select-all" class="icon-ok-sign icon-2x has-tooltip" data-toggle="tooltip" data-original-title="Select All" data-placement="top" data-trigger="hover"></a>' +
            '<a href="#" id="deselect-all" class="icon-ok-circle icon-2x has-tooltip" data-toggle="tooltip" data-original-title="Deselect All" data-placement="top" data-trigger="hover"></a>' +
            '<a href="#" id="message-selected" class="icon-envelope-alt icon-2x has-tooltip" data-toggle="tooltip" data-original-title="Message Selected" data-placement="top" data-trigger="hover"></a></div>');
        friendElement.append('<ul class="friends-list clearfix"></ul>');
        for(var i=0; i< friendsByLocation.length; i++){
            $('#friends-modal .friends-list').append('<li class="unselected"><img width=56 height=56 src="https://graph.facebook.com/'+friendsByLocation[i].id+'/picture" /><div class="friend-information"><span>'+friendsByLocation[i].name+'</span><a class="icon-facebook-sign" target="_blank" href="https://facebook.com/'+friendsByLocation[i].id+'/"></a></div></li>');
        }
        friendElement.modal({show: true, backdrop: true});
        $('#friends-modal .has-tooltip').tooltip();
        ko.applyBindings(appModel, document.getElementById('friends-modal'));
    });
    tripMarkers.push(marker);
}

function getFbFriendsAtLocation(location){
    var friends = [];
    for(var i=0;i<fbFriends.length; i++){
        if(fbFriends[i].location !== undefined && fbFriends[i].location.name === location){
            friends.push(fbFriends[i]);
        }
    }
    return friends;
}

function getFbFriendsAroundLocation(location, maxDistance){
    var friends = [];
    var checkLocation =  $.grep(locationsWithLatLng, function(e){return e.name === location});
    var locationLatLng = new google.maps.LatLng(checkLocation[0].lat, checkLocation[0].lng);
    for(var i=0;i<fbFriends.length; i++){
        if(fbFriends[i].location !== undefined){
            var friendLocation = $.grep(locationsWithLatLng, function(e){return e.name === fbFriends[i].location.name});
            if(friendLocation[0] !== undefined){
                var friendLatLng = new google.maps.LatLng(friendLocation[0].lat, friendLocation[0].lng);
                if(google.maps.geometry.spherical.computeDistanceBetween (friendLatLng, locationLatLng) < maxDistance){
                    friends.push(fbFriends[i]);
                }
            }
        }
    }
    return friends;
}

function hideAllFriendMarkers(){
    for(var j=0; j < friendMarkers.length; j++){
        friendMarkers[j].setVisible(false);
    }
}

function showAllFriendMarkers(){
    for(var j=0; j < friendMarkers.length; j++){
        friendMarkers[j].setVisible(true);
    }
}

function removeAllTripMarkers(){
    for(var k=0; k < tripMarkers.length; k++){
        tripMarkers[k].setMap(null);
    }
}

function hideFriendMarkerAtLocation(locationName){
    for(var j=0; j < friendMarkers.length; j++){
        if(friendMarkers[j].location === locationName){
            friendMarkers[j].setVisible(false);
        }
    }
}

function getFriendMarkerAtLocation(locationName){
    for(var j=0; j < friendMarkers.length; j++){
        if(friendMarkers[j].location === locationName){
            return friendMarkers[j];
        }
    }
    return null;
}

function geocodeLocation(location){
    $.ajax({
        url: 'http://api.geonames.org/searchJSON?',
        dataType: 'jsonp',
        data: {
            userName : 'dnharjani',
            q : location
        },
        success: function(result){
            // todo did you mean? functionality
            // add the top result location to a temporary array
            // callback to appModel to process the location data
        },
        error: function (xhr, textStatus) {
            console.log(textStatus);
        }
    });
}

function createListOfUnknownFriendsLocations(friendsList){
    var unknownFriendList = $('#unknown-friend-list');
    for(var i=0; i< friendsList.length; i++){
        unknownFriendList.append('<li><img width=56 height=56 src="https://graph.facebook.com/'+friendsList[i].id+'/picture" /><div class="friend-information"><span>'+friendsList[i].name+'</span><a class="icon-facebook-sign" target="_blank" href="https://facebook.com/'+friendsList[i].id+'/"></a></div></li>');
    }
}

function createListofFriendsPerCountry(locationsList){
    var countriesAdded = [];
    var countryListElement = $('#country-list');
    for(var i = 0; i< locationsList.length; i++){
        var location = locationsList[i];
        var countryObject = $.grep( countriesAdded, function(e){return e.country === location.countryName});

        var friendsInCountry = getFbFriendsAtLocation(location.name);
        if(countryObject.length === 0){
            countriesAdded.push({country : location.countryName , count : friendsInCountry.length, friends : friendsInCountry});
        }
        else{
           countryObject[0].count =  countryObject[0].count + getFbFriendsAtLocation(location.name).length;
           countryObject[0].friends =  countryObject[0].friends.concat(friendsInCountry);
        }
    }

    for(var j =0; j < countriesAdded.length; j++){
        var country =  countriesAdded[j];
        if(country.count !== 0){
            countryListElement.append('<li>'+countriesAdded[j].country + '-' +  countriesAdded[j].count+'</li>');
        }
    }
}


$(document).on('click', '#local-map', function(){
    friendsMap.setCenter(new google.maps.LatLng(me.location.lat,me.location.lng));
    friendsMap.setZoom(defaultZoom+8);
});

$(document).on('click', '#global-map', function(){
    zoomMapOut();
});

function zoomMapOut(){
    friendsMap.setCenter(defaultCenter);
    friendsMap.setZoom(defaultZoom);
}

$(document).on('click', '.message-friend', function(){
    var to = $(this).attr('data-friend-id');
    FB.ui({
        method: 'send',
        to: to,
        title: 'Project World',
        link: 'http://dnharjani.com/project-world'
    },
    function(param){
        console.log(param);
        // undefined or null = dialog closed
        // param.success:true  message sent
    });
});

$(document).on('click', '#friends-modal .friends-list li', function(){
    $(this).toggleClass('unselected selected');
    if($('#friends-modal .friends-list li.selected').length === 0){
        $('#friends-modal #deselect-all').hide();
        $('#friends-modal #select-all').show();
    }
    else if($('#friends-modal .friends-list li.unselected').length === 0){
        $('#friends-modal #deselect-all').show();
        $('#friends-modal #select-all').hide();
    }
});

$(document).on('click', '#friends-modal #select-all', function(){
    $('#friends-modal .friends-list li').removeClass('unselected').addClass('selected');
    $(this).hide();
    $('#friends-modal #deselect-all').show();
});

$(document).on('click', '#friends-modal #deselect-all', function(){
    $('#friends-modal .friends-list li').removeClass('selected').addClass('unselected');
    $(this).hide();
    $('#friends-modal #select-all').show();
});

$(document).on('click', '.off-screen-nav-button' , function(){
    $('#off-screen-nav').toggleClass('closed open');
});
