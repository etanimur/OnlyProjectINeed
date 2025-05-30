import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'auth-service-api',
    description: 'automatically generated swagger docs',
    version: '1.0.0',
  },
  host: 'localhost:6001',
  schemes: ['http'],
};

const opFile = './swagger-output.json';

const endPointsFile = ['./routes/auth.router.ts'];

swaggerAutogen()(opFile, endPointsFile, doc);
