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

    	this.updateFriends = function(userId, friendData, success){
          $.ajax({
    				type: "POST",
    				url: "/friends/"+userId,
                    contentType:"application/json",
    				data: JSON.stringify({ friends : friendData}),
                    success : function(){
                        success();
                    }
        	});
    	};

    	this.getNotifications = function(userId, success){
          $.ajax({
    				type: "GET",
    				url: "/notifications/"+userId,
    				success: function(data){
                        success(data);
                    }
        	});
    	};

        this.markNotificationsRead = function(userId, notificationIds){
          $.ajax({
                    type: "POST",
                    url: "/notifications/"+userId,
                    data: notificationIds
            });
        };
    }

    return new ApiService();

});