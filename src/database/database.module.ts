import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoClient } from 'mongodb';

import config from 'src/config';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigType<typeof config>) => {
        try {
          const { connection, host, user, password, port, dbName, cluster } =
            configService.mongo;
          return {
            uri: `${connection}+${host}://${user}:${password}@${cluster}.gqbzs.mongodb.net/${dbName}`,
            dbName,

            // mongodb+srv://db_usuario1:t8nb_pSTEw!p9BA@cluster-coop.gqbzs.mongodb.net
            //uri: `${connection}+${host}://${user}:${password}@${cluster}.gqbzs.mongodb.net/${dbName}`,
            // dbName,
          };
        } catch (error) {
          console.log('hay error', error);
        }
      },
      inject: [config.KEY],
    }),
  ],
  // providers: [{
  //   provide: 'MONGO',
  //   useFactory: async (configService: ConfigType<typeof config>) => {
  //     const { connection, host, port, dbName } = configService.mongo;
  //     const uri = `${connection}://${host}:${port}/?readPreference=primary`;
  //     const client = new MongoClient(uri);
  //     await client.connect();
  //     const database = client.db(dbName);
  //     return database;
  //   },
  //   inject: [config.KEY],
  // },],
  exports: [MongooseModule],
})
export class DatabaseModule {}
