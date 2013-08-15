define(["jquery", "knockout", "facebook"], function($, ko, facebook)
{

    var NavigationMenuModel = function(){
        var self = this;
        self.myName = ko.observable("");
        self.myId = ko.observable("100005535786845");

        self.initialize = function(){
            facebook.me.subscribe(function(newValue){
                self.myName(newValue.name);
                self.myId(newValue.id);
            }, this, "myInfo");
        }

        self.logout = function(){
            facebook.logout();
            location.hash = "#";
        };

        self.openMenu = function(){
            $('#slide-menu-right').addClass('cbp-spmenu-open');
        };

        self.closeMenu = function(){
            $('#slide-menu-right').removeClass('cbp-spmenu-open');
        };
    };

    return NavigationMenuModel;
});
