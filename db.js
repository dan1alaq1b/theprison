const mongoose = require('mongoose');

// Connection string obtained from MongoDB Atlas
const uri = 'mongodb+srv://danial:779hRsy0RVMRRRlP@gulag0.ij0pzbn.mongodb.net/?retryWrites=true&w=majority'; // Replace with your connection string

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => {
  console.log('Connected to MongoDB Atlas for gulagdb');
});

module.exports = connection; // Export the connection object
