define(["knockout", "underscore", "modernizr", "facebook", "mapService"], function(ko, _, Modernizr, facebook, mapService)
{

    var AppModel = function(){
        var self = this;

        self.loginStatus = ko.observable(false);
        self.selectedLocationFriends = ko.observableArray();
        self.me = {};
        self.friendsByLocation = [];
        self.friendsNoLocation = [];

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
        }

        self.logout = function(){
            var callback = function(){
                self.loginStatus(false);
            };
            facebook.logout(callback);
        }



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
                    self.friendsNoLocation = _.filter(result, function(item){
                        return item.current_location === null;
                    });
                    self.friendsByLocation = _.chain(result)
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
                                                    friends : value
                                                }
                                            })
                                            .value();
                    _.each(self.friendsByLocation, function(item){
                        mapService.addMarker(item, function(friendLocationObject, e){
                            self.selectedLocationFriends.removeAll();
                            _.each(friendLocationObject.friends, function(friend){
                                self.selectedLocationFriends.push(friend);
                            });
                        });
                    })
                    


                    

                }
                facebook.getFriendsInfo(success);
            }
            else{
                self.facebookFriends = ko.observableArray();
            }
        });

    };

    return new AppModel();
});
