define(["facebookSDK", "jquery", "underscore" ], function(FB, $, _){
    FB.init({
    appId      : 577325485612787,
    channelUrl : '/channel.html',
    status     : true, // check the login status upon init?
    cookie     : true, // set sessions cookies to allow your server to access the session?
    xfbml      : true  // parse XFBML tags on this page?    
    });

    function getLoginStatus(callback){
        FB.getLoginStatus(function(response) {
            callback(response);
        });
    }

    function getMyInfo(success, error){
        FB.api('/me', {fields: 'name,id,location'} , function(result) {
            if(result){
                success(result);
            }
            else{
                error();
            }
        }); 
    }

    function login(success, error) {
        FB.login(function(response) {
            if (response.authResponse) {
                success();
            }
            else {
                error();
            }
        }, {scope:'user_location, friends_location'});
    };

    function logout(callback){
        FB.logout(function(response) {
            callback();     
        });
    };

    function getFriendsInfo(callback){
        FB.api(
            '/fql',
            {
                q:{
                    'query1': "SELECT uid, name, current_location FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1=me())"
                }
            }
            ,
            function(response) {
                callback(response.data[0].fql_result_set);
            }
        );
    }

    var facebook = {
        login : login,
        logout : logout,
        getMyInfo : getMyInfo,
        getFriendsInfo : getFriendsInfo,
        getLoginStatus : getLoginStatus
    };

    return facebook;
});