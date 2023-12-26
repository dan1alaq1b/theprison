const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = process.env.PORT || 3000;

// Define your Swagger options and paths to your API files (visitor.js, admin.js, etc.)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'Your API Description',
    },
  },
  // Path to files containing OpenAPI specifications (e.g., your routes)
  apis: ['./admin.js', './visitor.js', './generatepass.js', './checkpass.js'],
};

const specs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('', swaggerUi.serve, swaggerUi.setup(specs)); //for direct access

// Your other middleware and routes can go here...

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
