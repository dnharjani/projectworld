define(["facebookSDK", "jquery", "underscore", "knockout"], function(FB, $, _, ko){
    FB.init({
    appId      : 577325485612787,
    channelUrl : '/channel.html',
    status     : true, 
    cookie     : true, 
    xfbml      : true   
    });

    var loginStatus = new ko.subscribable();
    var me = new ko.subscribable();

    function getLoginStatus(){
        FB.getLoginStatus(function(response) {
            loginStatus.notifySubscribers((response.status === "connected"), "loginStatus");
        });
    }

    function getMyInfo(){
        FB.api('/me', {fields: 'name,id,location'} , function(result) {
            me.notifySubscribers(result, "myInfo");
        }); 
    }

    function login() {
        FB.login(function(response) {
            loginStatus.notifySubscribers((response.status === "connected"), "loginStatus");    
        }, {scope:'user_location, friends_location'});
    };

    function logout(){
        FB.logout(function(response) {
            loginStatus.notifySubscribers(false, "loginStatus");          
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
        getLoginStatus : getLoginStatus,
        loginStatus : loginStatus,
        me : me
    };

    return facebook;
});