const mongoose = require('mongoose');

const plotSchema = new mongoose.Schema({
  name: String,
  location: String,
  size: Number,
});

module.exports = mongoose.model('Plot', plotSchema);
