define(["jquery"], function($)
{

    var ApiService = function(){

        this.addUser = function(userData){
        	console.log(userData);

            $.ajax({
  				type: "POST",
  				url: "/user/",
  				data: userData
        	});
    	};
    }

    return new ApiService();

});