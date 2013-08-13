var mongoose = require('mongoose'),
  	Friend = mongoose.model('Friend'),
  	User = mongoose.model('User'),
  	Location = mongoose.model('Location'),
  	_ = require('underscore');


exports.addUser = function(req, res){
	console.log(req.body);
};