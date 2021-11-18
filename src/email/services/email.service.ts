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
    feInicio: string,
    feFinal: string,
    fechaViaje: string,
    horaViaje: string,
  ) {
    await this.mailerService
      .sendMail({
        to: `${correo}`,
        //from: 'noreply@coop_project.com',
        subject: `El empleado ${empNombre} ${empApellido} tiene una suspension activa y registró un viaje`,
        text: 'Aviso',
        template: 'src/template/aviso',
        context: {
          username: `${secName}`,
          empleado: `${empNombre} ${empApellido}`,
          desde: `${feInicio}`,
          hasta: `${feFinal}`,
          viaje: `${fechaViaje}`,
          hora: `${horaViaje}`,
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
        // from: 'noreply@coop_project.com',
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
