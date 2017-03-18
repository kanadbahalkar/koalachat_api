const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

const ConversationSchema = new Schema({
  botType: {
    type: String
  },
  participants: [{ 
    type: Schema.Types.ObjectId, 
    ref: 'User'
  }],
  archive: {
    type: Boolean
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);
