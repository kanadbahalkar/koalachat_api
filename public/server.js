var express = require('express');
var app = express();

app.use(express.static(__dirname + '/'));

app.route('/*').get(function(req, res) { 
    return res.sendFile(__dirname + '/'); 
});

var port = 9000;
console.log("Express server running on " + port);
app.listen(port);
