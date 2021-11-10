import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

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

  exports: [MongooseModule],
})
export class DatabaseModule {}
