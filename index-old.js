const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dbConnection = require('./db'); // Import the database connection

const app = express();
const port = process.env.PORT || 4000;

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

client.connect().then(res => {
  console.log(res);
});

// Define your Swagger options and paths to your API files (visitor.js, admin.js, etc.)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OUR GULAG',
      version: '1.0.0',
      description: 'Welcome To Our 5-Star Gulag',
    },
  },
  // Path to files containing OpenAPI specifications (e.g., your routes)
  apis: ['./admin.js', './visitor.js', './generatepass.js', './checkpass.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('', swaggerUi.serve, swaggerUi.setup(specs)); //for direct access

// Your other middleware and routes can go here...

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
