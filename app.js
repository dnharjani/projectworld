
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    request = require('request'),
    _ = require('underscore'),
    mongoose = require('mongoose'),
    fs = require('fs');

// Bootstrap models
var models_path = __dirname + '/models/';
fs.readdirSync(models_path).forEach(function (file) {
   if (~file.indexOf('.js')) {
       require(models_path + '/' + file);
   }
});


// Connect to mongo
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
        "hostname":"localhost",
        "port":27017,
        "username":"",
        "password":"",
        "name":"",
        "db":"project-world"
    }
}

var generateMongoUrl = function(obj){
  obj.hostname = (obj.hostname || 'localhost');
  obj.port = (obj.port || 27017);
  obj.db = (obj.db || 'test');
  if(obj.username && obj.password){
    return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
  }
  else{
  return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
}
}
var mongourl = generateMongoUrl(mongo);
mongoose.connect(mongourl);


// Start app
var app = express();

// all environments
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
app.use(express.errorHandler());

var userController = require('./controllers/userController');

app.get('/', routes.index);
app.get('/notifications/:userid', userController.getNotifications);
app.post('/notifications/:userid', userController.markNotificationsRead);
app.post('/user/:userid' , userController.saveUser);
app.post('/friends/:userid' , userController.saveFriends);


app.listen(process.env.PORT || 3100);

exports = module.exports = app;


