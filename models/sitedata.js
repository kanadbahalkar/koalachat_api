const mongoose = require('mongoose'),  
      Schema = mongoose.Schema;

const SiteSchema = new Schema({
  faqUrl: {
    type: Schema.Types.ObjectId,
    required: true
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
    ref: 'User'
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('SiteData', SiteSchema);