'use strict';
const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

// Visitor Schema
const VisitorSchema = new Schema({
 	email: {
    type: String,
    lowercase: true,
    required: true,
    unique: false
  },
  ownerID: { 
    type: String,
    required: true,
    unique: false
  },
  ipAddress: { 
    type: String, 
    required: true 
  },
  location: { 
    type: String
  },
  channel: { 
    type: String
  },
  score: { 
    type: Number,
    default: 0
  },
  totalNumberOfVisits: { 
    type: Number,
    default: 0
  },
  firstSeen : { 
    type : Date, 
    default: Date.now 
  },
  lastSeen : { 
    type : Date, 
    default: Date.now 
  },
  lastVisitDuration : { 
    type : Date
  },
  nickname : { 
    type : String
  },
  blacklisted : { 
    type : Boolean 
  },
  archived : { 
    type : Boolean 
  }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
