var mongoose = require('mongoose'),
  	Schema = mongoose.Schema;

var NotificationSchema = new Schema({
	name : String,
	uid: String,
	oldLocation: ['LocationSchema'],
	newLocation: ['LocationSchema'],
	timestamp: {type: Date, default: Date.now},
	seen : Boolean
});

mongoose.model('Notification', NotificationSchema);