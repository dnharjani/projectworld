define(["gmaps", "modernizr"], function(GMaps, Modernizr)
{
    var currentMap = null;

    var MapService = function(centerLat, centerLng){

        this.createMap = function(){
            currentMap = new GMaps({
                div: 'map-panel',
                lat: 31.897909,
                lng: -5.593039,
                minZoom : 2,
                maxZoom : 12,
                zoom : 2
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
            currentMap.addMarker({
                lat : friendLocationObject.lat,
                lng : friendLocationObject.lng,
                title : friendLocationObject.city,
                click : function(event){
                    clickCallback(friendLocationObject);
                }
            })
        };
    };

    return new MapService();

});