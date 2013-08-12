require.config({
    paths: {
        "jquery": "vendor/jquery",
        "bootstrap": "vendor/bootstrap",
        "gmaps": "vendor/gmaps",
        "knockout" : "vendor/knockout",
        "underscore" : "vendor/underscore",
        "modernizr" : "vendor/modernizr",
        "facebookSDK": "//connect.facebook.net/en_US/all",
        "iscroll" : "vendor/iscroll",

        "appBindings" : "appBindings",

    },
    shim: {
        bootstrap: {
            deps: ["jquery"]
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

        facebookSDK : {
            exports: 'FB'
        }

    }
});

require(
    ["jquery", "knockout", "appBindings", "facebook"],function($, ko, appModel, facebook){
        appModel.initialize();
        ko.applyBindings(appModel);
    }
);