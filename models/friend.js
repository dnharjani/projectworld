var mongoose = require('mongoose'),
  	Schema = mongoose.Schema

var FriendSchema = new Schema({
  	uid: String,
	currentLocation: ['LocationSchema'],
	name: String 
});

mongoose.model('Friend', FriendSchema);

