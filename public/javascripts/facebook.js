// Todo make this into a module

var fbFriends, me;

window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
        appId      : fbapikey,
        channelUrl : '//localhost:8085/KIT/channel.html', // Channel File for x-domain communication
        status     : true, // check the login status upon init?
        cookie     : true, // set sessions cookies to allow your server to access the session?
        xfbml      : true  // parse XFBML tags on this page?
    });

    FB.Event.subscribe('auth.statusChange', function(response) {
        $('#fb-login-button').hide();
        $('#logged-in-container').show();
        $('#logged-in-container .has-tooltip').tooltip();

        if (response.status === 'connected') {
            FB.api('/me', {fields: 'name,id,location'} , function(result) {
                me = result;
                $(document).trigger('updatedMyInformation');
            });
        }
    });
};

(function(d, debug){
    var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
    if (d.getElementById(id)) {return;}
js = d.createElement('script'); js.id = id; js.async = true;
js.src = "//connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
ref.parentNode.insertBefore(js, ref);
}(document,true));

$(document).ready(function(){
    $(document.body).on("click", "#fb-login-button", function(){
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {

            } else {
                fbLogin();
            }
        });
    });

    $(document.body).on("click", "#fb-logout-button", function(){
        fbLogout();
    });
});

function fbLogin() {
    FB.login(function(response) {
        if (response.authResponse) {
            $('#fb-login-button').hide();
            $('#logged-in-container').show();
            $('#logged-in-container .has-tooltip').tooltip();
        }
        else {
            // cancelled
        }
    }, {scope:'user_location, friends_location'});
}

function fbLogout(){
    FB.logout(function(response) {
//        localStorage.removeItem('pw-'+me.id+'-friends');
//        localStorage.removeItem('pw-'+me.id+'-locations');
        $('#fb-login-button').show();
        $('#logged-in-container').hide();
        window.location.reload();
    });
}

$(document).on('updatedMyInformation', function(){
    FB.api('/me/friends', {fields: 'name,id,location'} , function(result) {
        fbFriends = result.data;
        $(document).trigger('updatedFriendLocations');
    });
});

