"use strict";

const Conversation = require('../models/conversation'),  
      Message = require('../models/message'),
      User = require('../models/user');

module.exports = {
  getConversations: function(req, res, next) {
    
    Conversation.find({ participants: req.params.visitorid })
    .select('_id')
    .sort('-createdAt')
    .exec(function(err, conversations) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      let fullConversations = [];
      if(conversations.length == 0) {
        return res.status(200).json({ conversations: conversations });
      }
      else {
        conversations.forEach(function(conversation) {
          Message.find({ 'conversationId': conversation._id })
            .populate({
              path: 'sender',
              select: 'profile.firstName profile.lastName'
            })
            .exec(function(err, message) {
              if (err) {
                res.send({ error: err });
                return next(err);
              }
              fullConversations.push(message);
              if(fullConversations.length === conversations.length) {
                return res.status(200).json({ conversations: fullConversations });
              }
            });
        });
      }
    });
  },

  getConversation: function(req, res, next) {
    Conversation.find({ conversationId: req.params.conversationid })
      .sort('-createdAt')
      .exec(function(err, messages) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }

        res.status(200).json({ conversation: messages });
      });
  },

  newConversation: function(req, res, next) {
    
    var reqData;
    try {
        reqData = JSON.parse(Object.keys(req.body)[0]);
    } catch (e) {
        reqData = req.body;
    }

    if(!req.params.recipient) {
      res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
      return next();
    }

    if(!reqData.message) {
      res.status(422).send({ error: 'Please enter a message.' });
      return next();
    }

    const conversation = new Conversation({
      participants: [reqData.ownerID, req.params.recipient]
    });

    conversation.save(function(err, newConversation) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      const message = new Message({
        conversationId: newConversation._id,
        body: reqData.message,
        sender: reqData.ownerID
      });

      message.save(function(err, newMessage) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }

        res.status(200).json({ message: 'Conversation started!', conversationId: conversation._id });
        return next();
      });
    });
  },

  sendReply: function(req, res, next) {

    const reply = new Message({
      conversationId: req.params.conversationId,
      body: req.body.message,
      sender: req.body.ownerID
    });

    reply.save(function(err, sentReply) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({ message: 'Reply successfully sent!' });
      return(next);
    });
  },

  // DELETE Route to Delete Conversation
  deleteConversation: function(req, res, next) {  
    Conversation.findOneAndRemove({
      $and : [
              { '_id': req.params.conversationId }, { 'participants': req.body._id }
            ]}, function(err) {
          if (err) {
            res.send({ error: err });
            return next(err);
          }

          res.status(200).json({ message: 'Conversation removed!' });
          return next();
    });
  }
}