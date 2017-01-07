'use strict';
const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

// Visitor Schema
const VisitorSchema = new Schema({
 	anonymous: {
     type: Boolean,
     default: true
  },
  ownerIDs: [{
    type: String,
    required: false
  }],
  ipAddresses: [{
    type: String,
    required: false
  }],
  visits : [{
    type: Date,
    required: true
  }],
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: false
  }
},
{
	timestamps: true
});

module.exports = mongoose.model('Visitor', VisitorSchema);
