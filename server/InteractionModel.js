const mongoose = require('mongoose');

// Update your Interaction schema to include username
const interactionSchema = new mongoose.Schema({
    articleId: String,
    userId: String,
    liked: { type: Boolean, default: false },
    comments: [{ 
      text: String, 
      timestamp: Date,
      username: String // Add username field to store with each comment
    }],
    shares: { type: Number, default: 0 },
    readMore: { type: Boolean, default: false },
  }, { timestamps: true });
  


const Interaction = mongoose.model('Interaction', interactionSchema);
module.exports = Interaction;
