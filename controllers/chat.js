"use strict";

const Conversation = require('../models/conversation'),
  Message = require('../models/message'),
  User = require('../models/user');

module.exports = {

  getConversations: function (req, res, next) {

    Conversation.find({ participants: req.body.ownerID })
      .sort('-createdAt')
      .exec(function (err, conversations) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }

        let fullConversations = [];
        let totalMessages = 0;
        if (conversations.length == 0) {
          return res.status(200).json({ conversations: conversations });
        }
        else {
          conversations.forEach(function (conversation) {
            var conversationDate = conversation.createdAt;
            Message.find({ 'conversation': conversation._id })
              .exec(function (err, messages) {
                if (err) {
                  res.send({ error: err });
                  return next(err);
                }

                totalMessages += messages.length;
                fullConversations.push({ messages: messages, date: conversationDate, messagesCount: messages.length, conversationID: conversation._id });

                if (fullConversations.length === conversations.length) {
                  return res.status(200).json({ 
                    conversations: fullConversations, 
                    totalMessages: totalMessages 
                  });
                }
              });
          });
        }
      });
  },

  getConversation: function (req, res, next) {
    Conversation.find({ participants: [req.body.ownerID, req.body.visitorID] })
      .sort('-createdAt')
      .exec(function (err, messages) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }
        res.status(200).json({ conversations: messages });
      });
  },

  newConversation: function (req, res, next) {

    var reqData;
    try {
      reqData = JSON.parse(Object.keys(req.body)[0]);
    } catch (e) {
      reqData = req.body;
    }

    if (!reqData.visitorID) {
      res.status(422).send({ error: 'Please choose a valid recipient for your message.' });
      return next();
    }

    if (!reqData.message) {
      res.status(422).send({ error: 'Please enter a message.' });
      return next();
    }

    const conversation = new Conversation({
      participants: [reqData.ownerID, reqData.visitorID]
    });

    conversation.save(function (err, conversation) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      const message = new Message({
        conversation: conversation._id,
        body: reqData.message,
        sender: reqData.senderID //Can be owner or visitor
      });

      message.save(function (err, message) {
        if (err) {
          res.send({ error: err });
          return next(err);
        }

        res.status(200).json({ conversation: conversation });
        return next();
      });
    });
  },

  sendReply: function (req, res, next) {

    var reqData;
    try {
      reqData = JSON.parse(Object.keys(req.body)[0]);
    } catch (e) {
      reqData = req.body;
    }

    const reply = new Message({
      conversation: reqData.conversationID,
      body: reqData.message,
      sender: reqData.sender,
      channel: reqData.channel
    });

    reply.save(function (err, sentReply) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({ message: sentReply });
      return (next);
    });
  },

  // DELETE Route to Delete Conversation
  deleteConversation: function (req, res, next) {
    Conversation.findOneAndRemove({
      $and: [
        { '_id': req.body.conversationID }, { 'participants': req.body._id }
      ]
    }, function (err) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      res.status(200).json({ message: 'Conversation removed!' });
      return next();
    });
  }
}