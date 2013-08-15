define(["jquery", "knockout", "facebook"], function($, ko, facebook)
{

    var WelcomeScreenModel = function(){
        var self = this;

        self.initialize = function(){
            facebook.loginStatus.subscribe(function(newValue){
                if(newValue === true){
                    $('#welcome-screen').modal('hide');
                }   
                else{
                    $('#welcome-screen').modal();
                } 
            }, this, "loginStatus");
        }

        self.login = function(){
            facebook.login();
        };
    };

    return WelcomeScreenModel;
});
