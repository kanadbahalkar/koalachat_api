'use strict';
var Visitor = require('../models/visitor');
var config = require('../config/main');

module.exports = {
  registerVisitor: function(req, res, next) {
    
    var reqData = JSON.parse(Object.keys(req.body)[0]);

    let ownerID = reqData.ownerID;
    let email = reqData.email || config.default_email;
    
    //Get ip address of the visitor
    var visitorip =  req.headers['x-forwarded-for'] || 
              req.connection.remoteAddress || 
              req.socket.remoteAddress ||
              req.connection.socket.remoteAddress;

    //if Visitor is not associated with owner then don't allow to create
    if (!ownerID) {
      console.log("Register visitor request is not associated with ownerID");
      return res.status(422).send({ error: "Register visitor request is not associated with ownerID" });
    }
    
    let visitor = new Visitor({
      email: email,
      ownerID: ownerID,
      ipAddress: visitorip,
      visitedAt: Date.now()
    });

    visitor.save(function(err) {
      if (err) return next(err);
      else {
        console.log("Visitor successfully registered: ", visitor);
        res.status(200).send({
          visitor: visitor
        });
      }
    });
  },

  //Set nickname for a visitor by email / id
  setNickname: function(req, res, next) {
    var json = '{"' + req.body.fieldname + '":"' + req.body.fieldvalue + '"}';
    var field = JSON.parse(json);

    Visitor.update(
      field, 
      { nickname : req.body.nickname }, 
      { multi: true }, 
      function(err, result) {
        if (err) return next(err);

        if(!result) {
          res.status(422).send({ message : 'Visitor with given email not found' });
        }
        else {
          if( req.body.email != config.default_email ){
            res.status(200).send({ 
              visitor : result 
            });
          }
        }
      });
  },

  //Set email of a visitor by email / id
  setEmail: function(req, res, next) {
    var json = '{"' + req.body.fieldname + '":"' + req.body.fieldvalue + '"}';
    var field = JSON.parse(json);

    Visitor.update(
      field, 
      { email : req.body.email }, 
      { multi: true }, 
      function(err, result) {
        if (err) return next(err);

        if(!result) {
          res.status(422).send({ message : 'Visitor with given email not found' });
        }
        else {
          if( req.body.email != config.default_email ){
            res.status(200).send({ 
              visitor : result 
            });
          }
        }
      });
  },

  //Blacklist visitor by - Email / IP Address / ID
  blacklistVisitor: function(req, res, next) {
    var json = '{"' + req.body.fieldname + '":"' + req.body.fieldvalue + '"}';
    var field = JSON.parse(json);

    Visitor.update(
      field, 
      { blacklisted : req.body.blacklisted }, 
      { multi: true }, 
      function(err, result) {
        if (err) return next(err);

        if(!result) {
          res.status(422).send({ message : 'Visitor with given IP not found' });
        }
        else {
          res.status(200).send({ 
            visitor : result 
          });
        }
      });
  },

  //Get visitors last week
  getVisitorsLastWeek: function(req, res, next) {
    Visitor.find(
      { ownerID : req.body.ownerID }, 
      function(err, result) {
        if (err) return next(err);

        if(!result) {
          res.status(422).send({ message : 'OwnerID not found' });
        }
        else {
          res.status(200).send({ 
            visitors : result 
          });
        }
      }).sort({date: -1});
  },

  //Get a list of all visitors / visitors with email / anonymous visitors
  getVisitors: function(req, res, next) {
    
    var json = '';
    var condition = '';

    if(req.params.filter == 'all'){
      json = { 
        ownerID  : req.body.ownerID 
      };
    }
    else if(req.params.filter == 'known'){
      json = { 
        ownerID: req.body.ownerID,
        email: { $ne: config.default_email }
      };
    }
    else if(req.params.filter == 'anonymous'){
      json = { 
        ownerID: req.body.ownerID,
        email: config.default_email
      };
    }

    Visitor.find(
      json, 
      function(err, result) {
        if (err) return next(err);

        if(!result) {
          res.status(422).send({ message : 'Visitor with given IP not found' });
        }
        else {
          res.status(200).send({ 
            visitor : result 
          });
        }
      });
  }
}
