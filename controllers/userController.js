var mongoose = require('mongoose'),
  	Friend = mongoose.model('Friend'),
  	User = mongoose.model('User'),
  	Location = mongoose.model('Location'),
  	_ = require('underscore');


exports.saveUser = function(req, res){
	User.findOne( { uid : req.params.userid}, function(err, user){
		if(err){
			console.log("Error while looking for user " + req.params.userid);
		}
		else{
			if(!user){
				var currentUser = new User({
					uid : req.params.userid,
					currentLocation : req.body.location.id,
					name : req.body.name,
					friends : []
				});

				currentUser.save(function(err, user){
					if(err){
						console.log("Error while saving user " + user.uid);
					}
					else{
						console.log("Saved user " + user.uid);	
					}
				});
			}
		}
	})
};

exports.saveFriends = function(req, res){
	User.findOne( { uid : req.params.userid}, function(err, user){
		if(err){
			console.log("Error while looking for user with uid " + req.params.userid);
		}
		else{
			if(!user){
				console.log("Couldn't find user "+ req.params.userid);
			}
			else{
				userFriends = [];
				_.each(req.body.friends, function(friend){
					// Check for friends with different locations before saving and push notifications
					var friendLocation = null;
					if(friend.current_location !== null){
						var friendLocation = new Location({
							id : friend.current_location.id,
							name: friend.current_location.name
						});
					}
					
					var currentFriend = new Friend({
						uid: friend.uid,
						name : friend.name,
						location : friendLocation  
					});

					userFriends.push(currentFriend);
				});

				user.friends = userFriends;
				user.save(function(err, user){
					if(err){
						console.log("Error while saving friends for user " + user.uid);
					}
					else{
						console.log("Saved friends for user " + user.uid);	
					}
				});
			}
		}
	})
};