let User = require('../models/user');

exports.updateWelcomeMessage = function(req, res, next) {
  //find owner in database
  //expects ownerID field in req body
  console.log('newMessage: '+req.body.newMessage);
  User.findOne({'id' : req.body.id}, function(err, owner) {
    if (err) return next(err);
    console.log("User Found: "+owner);
    owner.welcomeMessage = req.body.newMessage;
    owner.save();

    res.status(200).send({"message": "Welcome message updated successfully" , status: "success"});
  });
}
