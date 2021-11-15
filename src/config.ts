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

    email: {
      ehost: process.env.EMAIL_HOST,
      eport: parseInt(process.env.EMAIL_PORT),
      euser: process.env.EMAIL_USER,
      epass: process.env.EMAIL_PASS,
      efrom: process.env.EMAIL_FROM,
    },
    apiKey: process.env.API_KEY,

    jwtSecret: process.env.JWT_SECRET,

    rolViaje: process.env.ROL_VIAJE,

    headerName: process.env.HEADER_NAME,

    enviarCorreos: {
      rolCorreo1: process.env.ROL_CORREO_1,
      rolCorreo2: process.env.ROL_CORREO_2,
    },
  };
});
