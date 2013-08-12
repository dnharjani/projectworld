define(["knockout", "underscore", "modernizr", "facebook", "mapService", "iscroll"], function(ko, _, Modernizr, facebook, mapService)
{

    var AppModel = function(){
        var self = this;

        self.loginStatus = ko.observable(false);
        self.selectedLocationFriends = ko.observableArray();
        self.me = {};
        self.friendsByLocation = [];
        self.friendsNoLocation = [];
        self.currentLocation = ko.observable("");

        self.friendsListScroll = null;

        self.initialize = function(){
            facebook.getLoginStatus(self.updateLoginStatus);
            mapService.createMap();
        };

        self.updateLoginStatus = function(response){
            if(response.status === "connected"){
                self.loginStatus(true);
            }
            else{
                self.loginStatus(false);
            }
        };

        self.login = function(){
            var success = function(){
                self.loginStatus(true);
            };

            var error = function(){

            };

            facebook.login(success, error);
        };

        self.logout = function(){
            var callback = function(){
                self.loginStatus(false);
            };
            facebook.logout(callback);
        };

        self.openMenu = function(){
            $('#slide-menu').addClass('cbp-spmenu-open');
            if(self.friendsListScroll === null){
                self.friendsListScroll = new iScroll('scroll-wrapper', {checkDOMChanges: true, hScroll: false} );
            }
        };

        self.closeMenu = function(){
            $('#slide-menu').removeClass('cbp-spmenu-open');
        };



        var myInfoChangeSubscriber = self.loginStatus.subscribe(function(newValue){
            if(newValue === true){
                var success = function(result){
                    self.me = result;
                }

                facebook.getMyInfo(success);
            }
            else{
                self.me = {};
            }
        });

        var friendsInfoChangeSubscriber = self.loginStatus.subscribe(function(newValue){
            if(newValue === true){
                var success = function(result){
                    self.friendsNoLocation = getFriendsWithoutLocation(result);
                    self.friendsByLocation = sortFriendsByLocation(result);
                    drawMarkers();
                }
                facebook.getFriendsInfo(success);
            }
            else{
                self.facebookFriends = ko.observableArray();
            }
        });

        var drawMarkers = function(){
            _.each(self.friendsByLocation, function(item){
                mapService.addMarker(item, function(friendLocationObject, e){
                    self.selectedLocationFriends.removeAll();
                    _.each(friendLocationObject.friends, function(friend){
                        self.selectedLocationFriends.push(friend);
                    });
                    self.openMenu();
                    self.currentLocation(friendLocationObject.city);
                });
            })
        };

        var getFriendsWithoutLocation = function(fbQueryResult){
              _.filter(fbQueryResult, function(item){
                return item.current_location === null;
            });
        };

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

    return new AppModel();
});
