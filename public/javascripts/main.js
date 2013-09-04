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
    ['jquery', 'knockout', 'sammy', 'facebook', 'mapService', 'appModel', 'welcomeScreenModel'],
    function($, ko, Sammy, facebook, mapService, AppModel, WelcomeScreenModel){
        mapService.createMap(); 

        var appModel = new AppModel();
        var welcomeScreenModel = new WelcomeScreenModel();

        // Client side routing
        Sammy(function() {
            this.get('/', function() {
                appModel.closeNavigationMenu(); 
                appModel.closeLeftMenu();    
            });

            this.get('#/navigation', function() {
                appModel.openNavigationMenu(); 
                appModel.closeLeftMenu();    
            });
        }).run();

        welcomeScreenModel.initialize();
        appModel.initialize();

        // Login
        facebook.getLoginStatus();  

        ko.applyBindings(appModel, document.getElementById('slide-menu-left'));
        ko.applyBindings(appModel, document.getElementById('slide-menu-right'));
        ko.applyBindings(welcomeScreenModel, document.getElementById('welcome-screen'));
    }
);