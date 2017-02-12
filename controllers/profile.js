var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

module.exports = {
        updateWelcomeMessage: function(req, res, next) {
            //find owner in database
            //expects ownerID field in req body
            User.findOne({
                'userID': req.body._id
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
          User.findOne({'_id': req.body.ownerID}, function(err, owner) {
            console.log('Req fired');
            if (err) return next(err);

            if(!owner) {
              res.status(422).send({"message": "Owner with given id not found", "status": "failure"});
            }

            res.status(200).send({"owner": owner});
          });
        },

        // Update owner information
        updateOwnerInfo: function(req, res, next) {
          console.log(req.body)
          if(req.body.fieldname == 'password'){
            // update it with hash
            var password = req.body.fieldvalue;
            req.body.fieldvalue = bcrypt.hashSync(password);
          }

          var json = '{"' + req.body.fieldname + '":"' + req.body.fieldvalue + '"}';
          var field = JSON.parse(json);

          User.findOneAndUpdate(
            { '_id' : req.body.ownerID },
            field,
            function(err, owner) {
              if (err) return next(err);

              if(!owner) {
                res.status(422).send({ 'message': 'Owner with given id not found', 'status': 'failure' });
              }

              res.status(200).send({ owner : owner });
            });
        },

        // Update email frequency
        emailFrequency: function(req, res, next) {

          var json = '{"' + req.body.fieldname + '":"' + req.body.fieldvalue + '"}';
          var field = JSON.parse(json);

          User.findOneAndUpdate(
            { '_id' : req.body.ownerID },
            { emailFrequency:
              {
                newsletter: req.body.newsletter,
                billingUpdates: req.body.billingUpdates,
                announcements: req.body.announcements
              }
            },
            function(err, owner) {
              if (err) return next(err);

              if(!owner) {
                res.status(422).send({ 'message': 'Owner with given id not found', 'status': 'failure' });
              }

              res.status(200).send({ owner : owner });
            });
        },

        // Allow anonymous chats
        allowAnonymous: function(req, res, next) {

          User.findOneAndUpdate(
            { '_id' : req.body.ownerID },
            { 'allowAnonymous' : req.body.allowAnonymous },
            { upsert: true },
            function(err, owner) {
              if (err) return next(err);

              if(!owner) {
                res.status(422).send({ 'message': 'Owner with given id not found', 'status': 'failure' });
              }

              res.status(200).send({ allowAnonymous : owner.allowAnonymous });
            });
        },

        // Enable / Diable chatbot on the website
        togglePlugin: function(req, res, next) {

          console.log(req.body);
          User.findOneAndUpdate(
            { '_id' : req.body.ownerID },
            { 'enablePlugin' : req.body.enablePlugin },
            { upsert: true },
            function(err, owner) {
              if (err) return next(err);

              if(!owner) {
                res.status(422).send({ 'message': 'Owner with given id not found', 'status': 'failure' });
              }

              res.status(200).send({ enablePlugin : owner.enablePlugin });
            });
        },

        connectFacebook: function(req, res, next) {
          User.findOneAndUpdate(
            { '_id' : req.body.ownerID },
            {}
          )
        }
}
