define(["knockout", "underscore", "modernizr", "facebook", "mapService", "iscroll", "bootstrap"], function(ko, _, Modernizr, facebook, mapService)
{

    var AppModel = function(){
        var self = this;

        self.loginStatus = ko.observable(false);
        self.selectedLocationFriends = ko.observableArray();
        self.myName = ko.observable("");
        self.myId = ko.observable("100005535786845");
        self.friendsByLocation = [];
        self.friendsNoLocation = [];
        self.currentLocation = ko.observable("");
        self.selectedMessageFriends = ko.observableArray();

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
                $('#welcome-screen').modal();
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
                location.reload();
            };
            facebook.logout(callback);
        };

        self.openLeftMenu = function(){
            self.closeRightMenu();
            $('#slide-menu-left').addClass('cbp-spmenu-open');
            self.selectedMessageFriends.removeAll();
            if(self.friendsListScroll === null){
                self.friendsListScroll = new iScroll('left-scroll-wrapper', {checkDOMChanges: true, hScroll: false} );
            }
        };

        self.closeLeftMenu = function(){
            $('#slide-menu-left').removeClass('cbp-spmenu-open');
        };

        self.openRightMenu = function(){
            self.closeLeftMenu();
            $('#slide-menu-right').addClass('cbp-spmenu-open');
        };

        self.closeRightMenu = function(){
            $('#slide-menu-right').removeClass('cbp-spmenu-open');
        };

        self.toggleFriendSelect = function(friend, e){
            $(e.target).toggleClass('icon-ok-circle icon-ok-sign');
            if(self.selectedMessageFriends.indexOf(friend) !== -1){
                self.selectedMessageFriends.remove(friend);   
            }
            else{
                self.selectedMessageFriends.push(friend);
            }
        };

        self.sendMessageToSelected = function(){
            var ids = _.pluck(self.selectedMessageFriends(), 'uid').join();
            
        };

        var welcomeScreenChangeSubscriber = self.loginStatus.subscribe(function(newValue){
                if(newValue === true){
                   $('#welcome-screen').modal('hide');
                }
                else{
                    // Do nothing
                }
        });


        var myInfoChangeSubscriber = self.loginStatus.subscribe(function(newValue){
            if(newValue === true){

                var success = function(result){
                    self.myName(result.name);
                    self.myId(result.id);
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
                    self.openLeftMenu();
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

    return new AppModel();
});
