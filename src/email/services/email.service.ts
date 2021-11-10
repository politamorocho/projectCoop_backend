import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async enviarCorreo(
    correo: string,
    secName: string,
    empNombre: string,
    empApellido: string,
  ) {
    await this.mailerService
      .sendMail({
        to: `${correo}`,
        from: 'noreply@coop_project.com',
        subject: 'empleado se va de viaje con suspensiones activas',
        text: 'aviso',
        template: 'src/template/aviso',
        context: {
          username: `${secName}`,
          empleado: `${empNombre} ${empApellido}`,
        },
      })

      .then(() => {})
      .catch(() => {});
  }

  async enviarRecuperacionClave(
    nombre: string,
    correo: string,
    codigo: string,
  ) {
    await this.mailerService
      .sendMail({
        to: `${correo}`,
        from: 'noreply@coop_project.com',
        subject: 'Recuperacion de Clave de Acceso',
        text: 'aviso',
        template: 'src/template/recuperarClave',
        context: {
          username: `${nombre}`,
          codigo: `${codigo}`,
        },
      })

      .then(() => {})
      .catch(() => {});
  }
}
