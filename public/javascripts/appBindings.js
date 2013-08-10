define(["knockout", "underscore", "modernizr", "facebook"], function(ko, _, Modernizr, facebook)
{

    var AppModel = function(){
        var self = this;

        self.loginStatus = ko.observable(false);
        self.facebookFriends = ko.observableArray();
        self.me = {};

        self.initialize = function(){
            facebook.getLoginStatus(self.updateLoginStatus);
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
                    for(var i = 0; i < result.data.length; i++){
                        self.facebookFriends.push(result.data[i]);
                    }
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
