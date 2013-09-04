define(["knockout", "underscore", "modernizr", "facebook", "mapService", "apiService", "iscroll", "bootstrap"], function(ko, _, Modernizr, facebook, mapService, apiService)
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
        self.navMenuScroll = null;
        self.myName = ko.observable("");    
        self.myId = ko.observable("100005535786845");
        self.notifications = ko.observableArray();
        self.unseenNotifications = ko.computed(function(){
            return _.where(self.notifications(), {seen : false}).length;
        }, self);

        /**
         * Initializes the AppModel
         */
        self.initialize = function(){
            // Subscribe to the facebook loginstatus
            facebook.loginStatus.subscribe(function(newValue){
                self.loginStatus(newValue);
            }, this, "loginStatus");

            facebook.me.subscribe(function(newValue){
                self.myName(newValue.name);
                self.myId(newValue.id);
                apiService.updateUser(newValue);

                // Update and store the users friends
                facebook.getFriendsInfo(function(result){
                    apiService.updateFriends(newValue.id, result, function(){
                        apiService.getNotifications(newValue.id, function(data){
                            _.each(data.reverse(), function(notification){
                                 self.notifications.push(notification);
                            });
                        });
                    });
                    self.friendsNoLocation = getFriendsWithoutLocation(result);
                    self.friendsByLocation = sortFriendsByLocation(result);
                    drawMarkers();
                });
            }, this, "myInfo");
        };

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

        self.openNavigationMenu = function(){
            $('#slide-menu-right').addClass('cbp-spmenu-open');
            if(self.navMenuScroll === null){
                self.navMenuScroll = new iScroll('right-scroll-wrapper', {checkDOMChanges: true, hScroll: false} );
            }
        };

        self.closeNavigationMenu = function(){
            $('#slide-menu-right').removeClass('cbp-spmenu-open');
        };

        self.logout = function(){
            facebook.logout();
            location.hash = "#";
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
         *  Runs the facebook query to get current users info
         */ 
        var loginStatusChangeSubscriber = self.loginStatus.subscribe(function(newValue){
            if(newValue === true){
                facebook.getMyInfo();
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
                    location.hash = "#/location/";
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
