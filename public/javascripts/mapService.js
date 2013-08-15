define(["gmaps", "modernizr"], function(GMaps, Modernizr)
{
    var currentMap = null;
    var allowedBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(70.33956792419954, 178.01171875), 
        new google.maps.LatLng(83.86483689701898, -88.033203125)
    );

    var MapService = function(centerLat, centerLng){

        this.createMap = function(){
            currentMap = new GMaps({
                div: 'map-panel',
                lat: 31.897909,
                lng: -5.593039,
                minZoom : 2,
                maxZoom : 12,
                zoom : 3,
                disableDefaultUI : true,
            });

        };

        this.getMap = function(){
            return currentMap;
        };

        this.cleanMap = function(){
            currentMap.removeMarkers();
            currentMap.removePolylines();
        };

        this.addMarker = function(friendLocationObject, clickCallback){
            var markerIcon = "group-red";
            var friendCount = friendLocationObject.friends.length;
            if( friendCount >= 50){
                markerIcon = "group-black";
            }
            else if(friendCount >= 25){
                markerIcon = "group-blue";
            }
            else if(friendCount >= 10){
                markerIcon = "group-yellow";
            }
            else if(friendCount >= 5){
                markerIcon = "group-green";
            }


            currentMap.addMarker({
                lat : friendLocationObject.lat,
                lng : friendLocationObject.lng,
                title : friendLocationObject.city,
                icon : '/img/markers/'+markerIcon+'.png',
                click : function(event){
                    clickCallback(friendLocationObject);
                }
            });
        };
    };

    return new MapService();

});