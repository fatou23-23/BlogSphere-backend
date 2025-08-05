const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String,
      default: 'https://source.unsplash.com/random/400x200?sig=1',
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    views: {
      type: Number,
      default: 0
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ],
    category: {
      type: String,
      enum: ['lifestyle', 'sport', 'tech', 'santé'],
      default: 'lifestyle'
    },
    isDraft: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// ✅ Solution contre OverwriteModelError
module.exports = mongoose.models.Article || mongoose.model('Article', articleSchema);
