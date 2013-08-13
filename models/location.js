var mongoose = require('mongoose')
  	Schema = mongoose.Schema;

var LocationSchema = new Schema({
  	id: String,
  	name: String
});

mongoose.model('Location', LocationSchema);