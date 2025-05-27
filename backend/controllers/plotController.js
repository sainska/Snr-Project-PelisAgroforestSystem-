const Plot = require('../models/plot');

const getAllPlots = async (req, res) => {
  const plots = await Plot.find();
  res.json(plots);
};

module.exports = { getAllPlots };
