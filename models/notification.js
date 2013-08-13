var mongoose = require('mongoose'),
  	Schema = mongoose.Schema;

var NotificationSchema = new Schema({
  	uid: String,
	oldLocation: ['LocationSchema'],
	newLocation: ['LocationSchema'],
	timestamp: {type: Date, default: Date.now}
});

mongoose.model('Notification', NotificationSchema);