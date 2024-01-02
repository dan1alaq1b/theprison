//const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = 3002;
app.use(express.json());

// Connection string obtained from MongoDB Atlas
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = 'mongodb+srv://danial:779hRsy0RVMRRRlP@gulag0.ij0pzbn.mongodb.net/?retryWrites=true&w=majority'; // database connection string
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
/*
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
*/
connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', () => {
  console.log('Connected to MongoDB Atlas for gulagdb');
});

//module.exports = connection; // Export the connection object

client.connect().then(res => {
  console.log(res);
});
