define(["knockout", "underscore", "modernizr", "facebook", "mapService", "apiService", "iscroll", "bootstrap"], function(ko, _, Modernizr, facebook, mapService, apiService, Sammy)
{

    var AppModel = function(){
        var self = this;

        self.loginStatus = ko.observable();
        self.selectedLocationFriends = ko.observableArray();
        self.friendsByLocation = [];
        self.friendsNoLocation = [];
        self.currentLocation = ko.observable("");
        self.selectedMessageFriends = ko.observableArray();
        self.friendsListScroll = null;

        /**
         * Initializes the AppModel
         */
        self.initialize = function(){
            // Subscribe to the facebook loginstatus
            facebook.loginStatus.subscribe(function(newValue){
                self.loginStatus(newValue);
            }, this, "loginStatus");

            facebook.me.subscribe(function(newValue){
                apiService.updateUser(newValue);
            }, this, "myInfo");
        };

        /**
         *  Methods to open and close the left and right menu
         *  Left Menu is the list of friends at the currently selected location
         *  Right Menu is the navigation menu
         */ 

        self.openLeftMenu = function(){
            $('#slide-menu-left').addClass('cbp-spmenu-open');
            self.selectedMessageFriends.removeAll();
            if(self.friendsListScroll === null){
                self.friendsListScroll = new iScroll('left-scroll-wrapper', {checkDOMChanges: true, hScroll: false} );
            }
        };

        self.closeLeftMenu = function(){
            $('#slide-menu-left').removeClass('cbp-spmenu-open');
        };

        /**
         *  Toggles the icon for a selected friend and adds/removes them from the selected friends array
         */ 
        self.toggleFriendSelect = function(friend, e){
            $(e.target).toggleClass('icon-ok-circle icon-ok-sign');
            if(self.selectedMessageFriends.indexOf(friend) !== -1){
                self.selectedMessageFriends.remove(friend);   
            }
            else{
                self.selectedMessageFriends.push(friend);
            }
        };

        /**
         *  Opens a dialog to send a message to the currently selected friends
         */ 
        self.sendMessageToSelected = function(){
            var ids = _.pluck(self.selectedMessageFriends(), 'uid').join();
        };

        /**
         *  Subscriber to see when the loginstatus changes
         *  Runs the facebook query to get the current users friends info 
         *  Runs the facebook query to get current users info
         */ 
        var loginStatusChangeSubscriber = self.loginStatus.subscribe(function(newValue){
            if(newValue === true){
                facebook.getMyInfo();

                facebook.getFriendsInfo(function(result){
                    self.friendsNoLocation = getFriendsWithoutLocation(result);
                    self.friendsByLocation = sortFriendsByLocation(result);
                    drawMarkers();
                });
            }
            else{
                self.me = {};
                self.facebookFriends = ko.observableArray();
                mapService.cleanMap();       
            }
        });

        /**
         * Private functions
         */


         /**
          *  Draws a marker on the map for each friend returned from the Facebook Query
          */
        var drawMarkers = function(){
            _.each(self.friendsByLocation, function(item){
                mapService.addMarker(item, function(friendLocationObject, e){
                    self.selectedLocationFriends.removeAll();
                    _.each(friendLocationObject.friends, function(friend){
                        self.selectedLocationFriends.push(friend);
                    });
                    self.openLeftMenu();
                    self.currentLocation(friendLocationObject.city);
                });
            })
        };

        /**
         * Filters out friends without a current location into a seperate list
         */ 
        var getFriendsWithoutLocation = function(fbQueryResult){
              _.filter(fbQueryResult, function(item){
                return item.current_location === null;
            });
        };

        /**
         *  Filters and sorts friends into an Array by location name 
         */ 
        var sortFriendsByLocation = function(fbQueryResult){
            return  _.chain(fbQueryResult)
                    .filter(function(item){
                        return item.current_location !== null;
                    })
                    .groupBy(function(item){
                        return item.current_location.name;
                    })
                    .map(function(value, key){
                        return {
                            locationId : value[0].current_location.id,
                            location : key,
                            lat : value[0].current_location.latitude,
                            lng : value[0].current_location.longitude,
                            country : value[0].current_location.country,
                            city : value[0].current_location.city,
                            friends : _.sortBy(value, 'name')
                        }
                    })
                    .value();
        };

    };


    /**
     *      Binding Handlers
     **/

    ko.bindingHandlers.fadeVisible = {
    init: function(element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(ko.utils.unwrapObservable(value));
    },
    update: function(element, valueAccessor) {
        var value = valueAccessor();
        ko.utils.unwrapObservable(value) ? $(element).slideDown() : $(element).slideUp();
    }
};

    return AppModel;
});
