const mongoose = require('mongoose');

// Schema for storing predicted terms for each user
const userPredictedTermsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  predictedTerms: {
    type: [String],
    default: []
  },
  termScores: {
    type: [Number],
    default: []
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { collection: 'userPredictedTerms' }); 

const UserPredictionTerms = mongoose.model('UserPredictedTerms', userPredictedTermsSchema);
module.exports = UserPredictionTerms;
