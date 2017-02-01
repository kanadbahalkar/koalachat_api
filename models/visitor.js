'use strict';
const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

// Visitor Schema
const VisitorSchema = new Schema({
 	email: {
    type: String,
    lowercase: true,
    required: true
  },
  visitorID: { 
    type: String,
    required: true,
    unique: true
  },
  ownerID: { 
    type: String,
    required: true
  },
  ipAddress: { 
    type: String, 
    required: true 
  },
  visitedAt : { 
    type : Date, 
    default: Date.now 
  },
  nickname : { 
    type : String
  },
  blacklisted : { 
    type : Boolean 
  }
});

module.exports = mongoose.model('Visitor', VisitorSchema);
