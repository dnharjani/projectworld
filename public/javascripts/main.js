require.config({
    paths: {
        'jquery': 'vendor/jquery',
        'bootstrap': 'vendor/bootstrap',
        'gmaps': 'vendor/gmaps',
        'knockout' : 'vendor/knockout',
        'underscore' : 'vendor/underscore',
        'modernizr' : 'vendor/modernizr',
        'facebookSDK': '//connect.facebook.net/en_US/all',
        'iscroll' : 'vendor/iscroll',
        'sammy' : 'vendor/sammy',

        'appModel' : 'appModel',
        'navigationMenuModel' : 'navigationMenuModel',
        'welcomeScreenModel' : 'welcomeScreenModel',
        'mapService' : 'mapService',
        'apiService' : 'apiService'

    },
    shim: {
        bootstrap: {
            deps: ['jquery']
        },

        underscore: {
            exports: '_'
        },

        gmaps: {
            exports: 'GMaps'
        },

        modernizr: {
            exports: 'Modernizr'
        },

        sammy : {
            deps: ['jquery'],
            exports: 'Sammy'
        },

        facebookSDK : {
            exports: 'FB'
        }

    }
});

require(
    ['jquery', 'knockout', 'sammy', 'facebook', 'mapService', 'appModel', 'navigationMenuModel', 'welcomeScreenModel'],
    function($, ko, Sammy, facebook, mapService, AppModel, NavigationMenuModel, WelcomeScreenModel){
        mapService.createMap(); 

        var appModel = new AppModel();
        var navigationMenuModel = new NavigationMenuModel();
        var welcomeScreenModel = new WelcomeScreenModel();

        // Client side routing
        Sammy(function() {
            this.get('/', function() {
                navigationMenuModel.closeMenu(); 
                appModel.closeLeftMenu();    
            });

            this.get('#/navigation', function() {
                navigationMenuModel.openMenu();    
            });
        }).run();

        welcomeScreenModel.initialize();
        navigationMenuModel.initialize();
        appModel.initialize();

        // Login
        facebook.getLoginStatus();  

        ko.applyBindings(appModel, document.getElementById('slide-menu-left'));
        ko.applyBindings(welcomeScreenModel, document.getElementById('welcome-screen'));
        ko.applyBindings(navigationMenuModel, document.getElementById('slide-menu-right'));
    }
);