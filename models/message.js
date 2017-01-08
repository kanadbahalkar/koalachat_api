const mongoose = require('mongoose'),  
      Schema = mongoose.Schema;

const MessageSchema = new Schema({  
  conversationId: {
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
  draft: {
    type: Boolean
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
},
{
  timestamps: true // Saves createdAt and updatedAt as dates. createdAt will be our timestamp.
});

module.exports = mongoose.model('Message', MessageSchema);