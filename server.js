// Importing Node modules and initializing Express
const express = require('express'),
      app = express(),
      bodyParser = require('body-parser'),
      logger = require('morgan'),
      mongoose = require('mongoose'),
      config = require('./config/main'),
      socketEvents = require('./socketEvents'),
      passport = require('passport'),
      router = require('./router'),
      session = require('express-session');

//Setup HTTPS
var fs = require('fs');
var https = require('https');

var options = {
    key: fs.readFileSync('private.key'),
    cert: fs.readFileSync('certificate.pem')
};

//Update mongoose promise
mongoose.Promise = global.Promise;

// Database Connection
mongoose.connect(config.database);

var server = https.createServer(options, app).listen(config.port, function(){
    console.log('Server is running on port: ' + config.port);
});

var io = require('socket.io').listen(server);
socketEvents(io);

// Setting up basic middleware for all Express requests
app.use(logger('dev')); // Log requests to API using morgan

// Enable CORS from client-side
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'SECRET',
    saveUninitialized: true,
    resave: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session());

router(app);
