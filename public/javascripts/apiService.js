define(["jquery"], function($)
{

    var ApiService = function(){

        this.updateUser = function(userData){
          $.ajax({
    				type: "POST",
    				url: "/user/"+userData.id,
    				data: userData
        	});
    	};

    	this.updateFriends = function(userId, friendData){
          $.ajax({
    				type: "POST",
    				url: "/friends/"+userId,
                    contentType:"application/json",
    				data: JSON.stringify({ friends : friendData})
        	});
    	};

    	this.getNotifications = function(userId, success){
          $.ajax({
    				type: "GET",
    				url: "/"+userId+"/notifications",
    				success: success
        	});
    	};
    }

    return new ApiService();

});