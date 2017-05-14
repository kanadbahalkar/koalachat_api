"use strict";

const Conversation = require('../models/conversation'),
  Message = require('../models/message'),
  User = require('../models/user');

module.exports = {
  
  getMessages: function (req, res, next) {

    var participants;
    req.body.visitorID ? (participants = [ req.body.ownerID, req.body.visitorID ]) : (participants = req.body.ownerID);

    Conversation.find({ 
      participants: participants,
      $and: [ { participants: { $ne: "58d08da84409aa91be05190c" } } ]
    })
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

              console.log('----\n', fullConversations);
              
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

  getConversations: function (req, res, next) {

    var participants;
    req.body.visitorID ? (participants = [ req.body.ownerID, req.body.visitorID ]) : (participants = req.body.ownerID);

    // TODO: Create aggregate query for getting the counts directly from DB as opposed to process it on the server
    // Conversation.aggregate([
    //   {
    //     $match: {
    //       participants: participants,
    //       $and: [ { participants: { $ne: "58d08da84409aa91be05190c" } } ],
    //       createdAt: { $gt:new Date(Date.now() - 7*24*60*60 * 1000) }
    //     }
    //   },
    //   {
    //     $group: {
    //       _id: { 
    //         "year":  { "$year": "$createdAt" },
    //         "month": { "$month": "$createdAt" },
    //         "day":   { "$dayOfMonth": "$createdAt" }
    //       },
    //       count : { $sum : 1 }
    //     },
    //   }
    // ])
    // .exec(function(err, conversations){
    //   if (err) {
    //     console.log('Error Fetching conversations: ', err);
    //   } else {
    //     console.log('------', conversations);
    //   }
    // });

    Conversation.find({
      participants: participants,
      $and: [ { participants: { $ne: "58d08da84409aa91be05190c" } } ],
      createdAt: { $gte: new Date(Date.now() - 7*24*60*60 * 1000) }
    })
    .sort('-createdAt')
    .exec(function (err, conversations) {
      if (err) {
        res.send({ error: err });
        return next(err);
      }

      var dayCounter = 24*60*60 * 1000;
      let dailyConversationCount = [
        {
          date: new Date(Date.now()),
          conversationsCount: 0
        },
        {
          date: new Date(Date.now() - 1*dayCounter),
          conversationsCount: 0
        },
        {
          date: new Date(Date.now() - 2*dayCounter),
          conversationsCount: 0
        },
        {
          date: new Date(Date.now() - 3*dayCounter),
          conversationsCount: 0
        },
        {
          date: new Date(Date.now() - 4*dayCounter),
          conversationsCount: 0
        },
        {
          date: new Date(Date.now() - 5*dayCounter),
          conversationsCount: 0
        },
        {
          date: new Date(Date.now() - 6*dayCounter),
          conversationsCount: 0
        }
      ];
      
      conversations.forEach(function (conversation) {
        for(var i=0; i<7; i++){
          if(conversation.createdAt.toLocaleDateString() == dailyConversationCount[i].date.toLocaleDateString()){
            dailyConversationCount[i].conversationsCount += 1;
          }
        }
      });

      return res.status(200).json({
        dailyConversationCount: dailyConversationCount,
        totalConversationsLastWeek: conversations.length
      });
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