var mongoose = require('mongoose'),
  	Friend = mongoose.model('Friend'),
  	User = mongoose.model('User'),
  	Location = mongoose.model('Location'),
  	Notification = mongoose.model('Notification'),
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
					friends : [],
					notifications : []
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

				var savedFriends = user.friends;
				user.friends = [];
				_.each(req.body.friends, function(friend){

					var savedFriend = _.find(savedFriends, function(testFriend){
						return (friend.uid+'' === testFriend.uid+'')
					});

					if(savedFriend && savedFriend.currentLocation && friend.current_location && (friend.current_location.id+''  !== savedFriend.currentLocation[0].location_id+'') ){
						var newLocation = new Location({
							location_id : friend.current_location.id,
							name: friend.current_location.name
						})

						var newNotification = new Notification({
							oldLocation : [savedFriend.currentLocation],
							newLocation : [newLocation],
							seen : false
						})

						user.notifications.push(newNotification);	
					}

					var currentFriend = new Friend({
						uid: friend.uid,
						name : friend.name,
						currentLocation : []
					});

					if(friend.current_location){
						var friendLocation = new Location({
							location_id : friend.current_location.id,
							name: friend.current_location.name
						});
						currentFriend.currentLocation = [friendLocation];
					}

					user.friends.push(currentFriend);
				});
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

exports.getNotifications = function(req, res){

	User.findOne( { uid : req.params.userid}, function(err, user){
		if(err){
			console.log("Error while looking for user with uid " + req.params.userid);
			res.json([]);
		}
		else{
			if(!user){
				res.json([]);
			}
			else{
				res.json(user.notifications);
			}	
		}
	})
};
