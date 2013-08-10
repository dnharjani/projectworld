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
    };

    return new MapService();

});