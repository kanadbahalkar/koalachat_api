var User = require('../models/user');
var bcrypt = require('bcrypt-nodejs');

module.exports = {
  updateWelcomeMessage: function(req, res, next) {
      //find owner in database
      //expects ownerID field in req body
      User.findOne({
          '_id': req.body.ownerID
      }, function(err, owner) {
          if (err) return next(err);
          if(!owner || owner == undefined || owner == null) {
            res.status(422).send({"message": "Owner with given id not found", "status": "failure"});
          }
        
          owner.welcomeMessage = req.body.welcomeMessage;
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
      if (err) return next(err);

      if(!owner) {
        res.status(422).send({"message": "Owner with given id not found", "status": "failure"});
      }

      res.status(200).send({"owner": owner});
    });
  },

  // Update owner information
  updateOwnerInfo: function(req, res, next) {
    
    var json;
    var field;

    if(req.body.fieldname == 'password'){
      // update it with hash
      var password = req.body.fieldvalue;
      req.body.fieldvalue = bcrypt.hashSync(password);
    }
    else if(req.body.fieldname == 'socialAccounts'){
      json = '{$push:{"' + req.body.fieldname + '":' + '{"provider_id":"' + req.body.provider_id + '","provider":"' + req.body.provider + '","email":"'+ req.body.email + '","name":"' + req.body.name + '"}}}';
      field = json;
    }
    else if(req.body.fieldname == 'ownerName'){
      json = '{"profile.firstName":"' + req.body.fieldvalue.split(" ")[0] + '","profile.lastName":"' + req.body.fieldvalue.split(" ")[1] + '"}';
      field = JSON.parse(json);
    }
    else {
      json = '{"' + req.body.fieldname + '":"' + req.body.fieldvalue + '"}';
      field = JSON.parse(json);
    }
    
    User.findOneAndUpdate(
      { '_id' : req.body.ownerID },
      field,
      function(err, owner) {
        if (err) return next(err);

        console.log('Owner: ', owner);
        if(!owner) {
          res.status(422).send({ 'message': 'Owner with given id not found', 'status': 'failure' });
        }

        res.status(200).send({ owner : owner });
      });
  },

  // Update Social Accounts
  updateSocialAccounts: function(req, res, next){
    User.findOne({
      '_id' : req.body.ownerID
    }, function(err, user) {
        if (err) return done(err);

        if (user) {
          var managedPages = [];
          if(req.body.managedPages != '' && req.body.managedPages)
            managedPages = JSON.parse(req.body.managedPages);
          
          //Create object for social accounts
          var newSocialAccount = {
            provider_id: req.body.provider_id,
            provider: req.body.provider,
            email: req.body.email,
            name: req.body.name,
          };

          var profile = {
            firstName: req.body.name.split(" ")[0],
            givenName: '',
            lastName: req.body.name.split(" ")[1],
            gender: req.body.gender,
            photo: req.body.photo
          }

          var socialAccountFound = user.socialAccounts.filter(function(item) {
              return item.provider == req.body.provider;
          });
          
          //Update user with new social account and managed pages
          if(user.socialAccounts != null && socialAccountFound.length <= 0){
            user.socialAccounts.push(newSocialAccount);
            managedPages.forEach(function(managedPage) {
              user.managedPages.push(managedPage);
            });
          }

          user.profile = profile;
          user.save();
        } 
        else {
          console.log('User not found... :(');
        }
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
    User.findOne(
      { '_id' : req.body.ownerID },
      { 'allowAnonymous' : req.body.allowAnonymous },
      function(err, owner) {
        if (err) return next(err);

        if(!owner) {
          res.status(422).send({ 'message': 'Owner with given id not found', 'status': 'failure' });
        }

        owner.allowAnonymous = req.body.allowAnonymous;
        owner.save();

        res.status(200).send({ allowAnonymous : owner.allowAnonymous });
      });
  },

  // Check if Owner Allows anonymous chats
  checkAllowAnonymous: function(req, res, next) {
    User.findOne(
      { '_id' : req.body.ownerID },
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
    User.findOne(
      { '_id' : req.body.ownerID },
      { 'enablePlugin' : req.body.enablePlugin },
      function(err, owner) {
        if (err) return next(err);

        if(!owner) {
          res.status(422).send({ 'message': 'Owner with given id not found', 'status': 'failure' });
        }

        owner.enablePlugin = req.body.enablePlugin;
        owner.save();

        res.status(200).send({ enablePlugin : owner.enablePlugin });
      });
  }
}
