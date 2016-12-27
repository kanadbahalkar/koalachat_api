var User = require('../models/user');

// exports.updateWelcomeMessage = function(req, res, next) {
//   //find owner in database
//   //expects ownerID field in req body
//   console.log('newMessage: '+req.body.newMessage);
//   User.findOne({'id' : req.body.id}, function(err, owner) {
//     if (err) return next(err);
//     console.log("User Found: "+owner);
//     owner.welcomeMessage = req.body.newMessage;
//     owner.save();
//
//     res.status(200).send({"message": "Welcome message updated successfully" , status: "success"});
//   });
// }


module.exports = {
        updateWelcomeMessage: function(req, res, next) {
            //find owner in database
            //expects ownerID field in req body
            console.log('newMessage: ' + req.body.newMessage);
            console.log('UserID: '+req.body.userID);
            User.findOne({
                'userID': req.body.userID
            }, function(err, owner) {
                if (err) return next(err);
                if(!owner) {
                  res.status(422).send({"message": "Owner with given id not found", "status": "failure"});
                }
                console.log("User Found: " + owner);

                owner.welcomeMessage = req.body.newMessage;
                owner.save();

                res.status(200).send({
                    "message": "Welcome message updated successfully",
                    status: "success"
                });
            });
        },

        // Get's owner information
        getOwnerInfo: function(req, res, next) {
          console.log('UserID: '+req.body.userID);
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
