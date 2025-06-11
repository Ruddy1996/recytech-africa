const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RecyTech Africa API',
      version: '1.0.0',
      description: 'Documentation de l’API RecyTech Africa',
    },
  },
  apis: ['./src/routes/*.js'], // les fichiers de routes à scanner
};

module.exports = swaggerJSDoc(options);
