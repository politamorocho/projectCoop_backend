import { registerAs } from '@nestjs/config';

export default registerAs('config', () => {
  return {
    database: {
      name: process.env.DATABASE_NAME,
      port: process.env.DATABASE_PORT,
    },
    mongo: {
      dbName: process.env.MONGO_DB,
      port: parseInt(process.env.MONGO_PORT),
      host: process.env.MONGO_HOST,
      connection: process.env.MONGO_CONNECTION,
      user: process.env.MONGO_USERNAME,
      password: process.env.MONGO_PASSWORD,
      cluster: process.env.MONGO_CLUSTER,
    },
    apiKey: process.env.API_KEY,

    jwtSecret: process.env.JWT_SECRET,
  };
});
