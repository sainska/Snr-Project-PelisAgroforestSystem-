const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const plotRoutes = require('./routes/plotRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/pelis_agro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/plots', plotRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
