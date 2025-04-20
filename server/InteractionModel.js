const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    articleId: String,
    userId: String,
    liked: { type: Boolean, default: false },
    saved: { type: Boolean, default: false }, 
    downloaded: { type: Boolean, default: false },
    articleData: Object, // Store article data for saved articles
    comments: [{ 
      text: String, 
      timestamp: Date,
      username: String // Keep username field as is
    }],
    shares: { type: Number, default: 0 },
    readMore: { type: Boolean, default: false },
  }, { timestamps: true });

const Interaction = mongoose.model('Interaction', interactionSchema);
module.exports = Interaction;