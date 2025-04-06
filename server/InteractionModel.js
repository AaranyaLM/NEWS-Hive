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



// ArticleInfo model if you don't have it already
const articleInfoSchema = new mongoose.Schema({
  articleId: String, // Usually the URL for NewsAPI articles
  title: String,
  url: String,
  source: String,
  imageUrl: String,
  publishedAt: Date
});

const ArticleInfo = mongoose.model('ArticleInfo', articleInfoSchema);