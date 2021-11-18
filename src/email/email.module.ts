import { Global, Module } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './services/email.service';
import config from 'src/config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigType<typeof config>) => {
        const { ehost, eport, euser, epass, efrom } = configService.email;

        return {
          transport: {
            host: `${ehost}`,
            port: eport,
            secure: true,
            auth: {
              user: `${euser}`,
              pass: `${epass}`,
            },
          },

          defaults: {
            from: `${efrom}`,
          },
          preview: true,
          template: {
            // dir: 'src/template/aviso.html',
            adapter: new HandlebarsAdapter(),
            // options: {
            //   strict: true,
            // },
          },
        };
      },
      inject: [config.KEY],
    }),
  ],
  providers: [EmailService],
  exports: [MailerModule, EmailService],
})
export class EmailModule {}
