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

        'appBindings' : 'appBindings',
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
    ['jquery', 'knockout', 'appBindings', 'facebook'],function($, ko, appModel, facebook){
        appModel.initialize();
        ko.applyBindings(appModel);
    }
);