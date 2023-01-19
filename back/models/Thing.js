const mongoose = require('mongoose');

const thingSchema = mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  mainPepper: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  heat: { type: Number, required: true }, //entre 1 et 100
  likes: { type: Number, default:0, required: true },
  dislikes: { type: Number, default:0, required: true },
  usersLiked: { type: [String], required: true }, //tableau
  usersDisliked: { type: [String], required: true }, //tableau
});

module.exports = mongoose.model('Thing', thingSchema);