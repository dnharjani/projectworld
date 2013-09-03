var mongoose = require('mongoose'),
  	Schema = mongoose.Schema

var UserSchema = new Schema({
  	uid: String,
	currentLocation: String,
	name: String,
	friends: ['FriendSchema'],
	notifications: ['NotificationSchema']
});

mongoose.model('User', UserSchema);