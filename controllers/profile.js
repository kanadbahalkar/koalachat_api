var User = require('../models/user');

module.exports = {
        updateWelcomeMessage: function(req, res, next) {
            //find owner in database
            //expects ownerID field in req body
            User.findOne({
                'userID': req.body.userID
            }, function(err, owner) {
                if (err) return next(err);
                if(!owner || owner == undefined || owner == null) {
                  res.status(422).send({"message": "Owner with given id not found", "status": "failure"});
                }
                
                console.log("User Found: " + owner);

                owner.welcomeMessage = req.body.newMessage;
                owner.save();

                res.status(200).send({
                    message: "Welcome message updated successfully",
                    status: "success"
                });
            });
        },

        // Get's owner information
        getOwnerInfo: function(req, res, next) {
          User.findOne({'userID': req.body.userID}, function(err, owner) {
            if (err) return next(err);

            if(!owner) {
              res.status(422).send({"message": "Owner with given id not found", "status": "failure"});
            }

            console.log("User Found: " + owner);
            res.status(200).send({"owner": owner});
          });
        }
}
