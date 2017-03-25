const mongoose = require('mongoose'),  
      Schema = mongoose.Schema;

const MessageSchema = new Schema({  
  conversation: {
    type: Schema.Types.ObjectId,
    required: true
  },
  messageType: {
    type: String,
    default: 'plain-text'
  },
  body: {
    type: String,
    required: true
  },
  channel: {
    type: String
  },
  draft: {
    type: Boolean,
    default: false
  },
  sender: {
    type: String
  }
},
{
  timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

module.exports = mongoose.model('Message', MessageSchema);