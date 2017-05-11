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

  //Update a visitor
  updateVisitorProfile: function(req, res, next) {
    
    Visitor.findOne(
      { '_id' : req.body.visitorID },
      function(err, visitor) {
        if (err) res.status(422).send({ message : 'Error: ' + err });

        if(!visitor) res.status(422).send({ message : 'Visitor with given ID not found' });
        
        visitor.name = req.body.updatedName;
        visitor.nickname = req.body.updatedNickname;
        visitor.email = req.body.updatedEmail;
        visitor.phone = req.body.updatedPhone;
        visitor.gender = req.body.updatedGender;
        
        visitor.save();

        res.status(200).send({
          visitor : visitor
        });
      });
  },

  //Set email of a visitor by email / id
  setEmail: function(req, res, next) {
    Visitor.findOneAndUpdate(
      { '_id' : req.body.vid },
      { 'email' : req.body.email },
      function(err, result) {
        if (err) return next(err);

        if(!result) {
          res.status(422).send({ message : 'Visitor with given email not found' });
        }
        else {
          if(req.body.email !== config.default_email ){
            res.status(200).send({
              visitor : result
            });
          }
        }
      });
  },

  //Delete a visitor (Mark it as Archived)
  archiveVisitor: function(req, res, next) {
    Visitor.findOneAndUpdate(
      { '_id' : req.body.vid },
      { 'archived' : true },
      function(err, result) {
        if (err) return next(err);

        if(!result) {
          res.status(422).send({ message : 'Visitor with given ID not found' });
        }
        else {
          res.status(200).send({
            visitor : result
          });
        }
      });
  },

  //Blacklist a visitor
  blacklistVisitor: function(req, res, next) {
    Visitor.findOneAndUpdate(
      { '_id' : req.body.vid },
      { 'blacklisted' : true },
      { upsert : true }, 
      function(err, result) {
        if (err) return next(err);

        if(!result) {
          res.status(422).send({ message : 'Visitor with given ID not found' });
        }
        else {
          res.status(200).send({
            visitor : result
          });
        }
      });
  },

  //Update visitor attribs
  updateVisitor: function(req, res, next) {
    var reqData = JSON.parse(Object.keys(req.body)[0]);
    Visitor.findOne(
      { '_id' : reqData.vid },
      function(err, visitor) {
        if (err) return next(err);

        if(!visitor) {
          res.status(422).send({ message : 'Visitor with given IP not found' });
        }
        else {
          //Update fields and save
          visitor.lastVisitDuration = Date.now() - visitor.lastSeen;
          visitor.lastSeen = Date.now();
          visitor.totalNumberOfVisits = visitor.totalNumberOfVisits + 1 || 1;
          visitor.score = (visitor.totalNumberOfVisits * (visitor.lastVisitDuration / 1000)).toFixed(0) || 0;
          visitor.live = true;
          visitor.save();

          res.status(200).send({
            visitor : visitor
          });
        }
      });
  },

  //Get visitors last week
  getVisitorsLastWeekCount: function(req, res, next) {
    Visitor.count(
      { ownerID : req.body.ownerID, "lastSeen":{ $gt: new Date(Date.now() - 24*60*60*7 * 1000) } },
      function(err, result) {
        if (err) return next(err);
        res.status(200).send({
          visitorsLastWeek : result
        });
      }).sort({date: -1});
  },

  //Live or Offline visitor
  updateVisitorStatus: function(req, res, next) {
    
    var reqData = JSON.parse(Object.keys(req.body)[0]);

    Visitor.findOneAndUpdate(
      { '_id' : reqData.visitorID },
      { 'live' : reqData.live },
      function(err, visitor) {
        if (err) return next(err);

        if(!visitor) {
          res.status(422).send({ message : 'Visitor with given ID not found' });
        }
        else {
          res.status(200).send({
            'success' : 'Success'
          });
        }
      });
  },

  //Mark visitor as important
  markVisitorAsImporatant: function(req, res, next) {
    
    // var reqData = JSON.parse(Object.keys(req.body)[0]);
    
    Visitor.findOneAndUpdate(
      { '_id' : req.body.vid },
      { 'important' : req.body.important },
      function(err, visitor) {
        if (err) { res.status(500).send({ message : 'Error!'}); }

        if(!visitor) {
          res.status(422).send({ message : 'Visitor with given ID not found' });
        }
        else {
          res.status(200).send({
            visitor : visitor
          });
        }
      });
  },

  //Get number of live visitors
  getLiveVisitorsCount: function(req, res, next) {
    Visitor.count(
      { ownerID : req.body.ownerID, live : true },
      function(err, visitors) {
        if (err) return next(err);
        res.status(200).send({
          liveVisitors : visitors
        });
      });
  },

  //Increment number of messages sent by a visitor
  incrementMessageCount: function(req, res, next) {
    var reqData = JSON.parse(Object.keys(req.body)[0]);
    Visitor.findOneAndUpdate(
      { '_id' : reqData.visitorID },
      { upsert : true },
      function(err, visitor) {
        if (err) return next(err);

        if(!visitor) {
          res.status(422).send({ message : 'Visitor with given ID not found' });
        }
        else {
          //Update messages count
          visitor.totalNumberOfMessages ? visitor.totalNumberOfMessages+=1 : visitor.totalNumberOfMessages = 1;
          visitor.save();

          res.status(200).send({
            visitor : visitor
          });
        }
      });
  },

  //Get a list of all visitors / visitors with email / anonymous visitors
  getVisitors: function(req, res, next) {

    var json = '';
    var condition = '';

    if(req.params.filter == 'all'){
      json = {
        ownerID  : req.body.ownerID,
        archived: { $ne: true },
        blacklisted: { $ne: true },
      };
    }
    else if(req.params.filter == 'active'){
      json = {
        ownerID  : req.body.ownerID,
        archived: { $ne: true },
        blacklisted: { $ne: true },
        totalNumberOfMessages: { $gt: 0 }
      };
    }
    else if(req.params.filter == 'live'){
      json = {
        ownerID  : req.body.ownerID,
        live: { $eq: true },
        archived: { $ne: true },
        blacklisted: { $ne: true },
        totalNumberOfMessages: { $gt: 0 }
      };
    }
    else if(req.params.filter == 'important'){
      json = {
        ownerID  : req.body.ownerID,
        important: { $eq: true },
        archived: { $ne: true },
        blacklisted: { $ne: true },
        totalNumberOfMessages: { $gt: 0 }
      };
    }
    else if(req.params.filter == 'recent'){
      var today = new Date();
      json = {
        ownerID  : req.body.ownerID,
        lastSeen: { $lt: today, $gt: today.getDate() - 1 },
        archived: { $ne: true },
        blacklisted: { $ne: true },
        totalNumberOfMessages: { $gt: 0 }
      };
    }
    else if(req.params.filter == 'known'){
      json = {
        ownerID: req.body.ownerID,
        email: { $ne: config.default_email },
        archived: { $ne: true },
        blacklisted: { $ne: true }
      };
    }
    else if(req.params.filter == 'anonymous'){
      json = {
        ownerID: req.body.ownerID,
        email: { $eq: config.default_email },
        archived: { $ne: true },
        blacklisted: { $ne: true }
      };
    }
    else if(req.params.filter == 'blacklisted'){
      json = {
        ownerID: req.body.ownerID,
        archived: { $ne: true },
        blacklisted: { $eq: true }
      };
    }
    else if(req.params.filter == 'one'){
      json = {
        _id: req.body.visitorID
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
            visitors : result
          });
        }
      });
  }
}
