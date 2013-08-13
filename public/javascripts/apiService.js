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

    	this.updateFriends = function(userId, userData){
            $.ajax({
  				type: "POST",
  				url: "/"+userId+"/friends",
  				data: userData
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