const mongoose = require('mongoose'),  
      Schema = mongoose.Schema;

const SiteData = new Schema({
  website: {
    type: String,
    required: true
  },
  faqUrl: {
    type: String,
    required: true
  },
  qnaList: {
    type: Array,
    default: []
  },
  keywordsOnSite: {
    type: Array,
    default: []
  },
  crawlHistory: {
    type: Array,
    default: []
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('SiteData', SiteData);