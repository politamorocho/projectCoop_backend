import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Model, FilterQuery } from 'mongoose';
import * as moment from 'moment';

const mongoose = require('mongoose');
import { InjectModel } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { Viaje } from '../entities/viaje.entity';
import {
  CrearViajeDto,
  FiltroViajeDto,
  ActualizarViajeDto,
  AgregarEmpleado2Dto,
} from '../dtos/viaje.dto';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { BusService } from './bus.service';
import { RutaService } from './ruta.service';
import { RolService } from 'src/usuario/services/rol.service';
import { SuspensionService } from 'src/usuario/services/suspension.service';
import { EmailService } from '../../email/services/email.service';
import { FiltroFechaDto } from '../../usuario/dtos/suspension.dto';

@Injectable()
export class ViajeService {
  constructor(
    @InjectModel(Viaje.name) private viajeModel: Model<Viaje>,

    private usuarioService: UsuarioService,
    private rolService: RolService,
    private busService: BusService,
    private rutaService: RutaService,
    private suspensionService: SuspensionService,
    private emailService: EmailService,
  ) {}

  //crear un viaje
  async crearViaje(viaje: CrearViajeDto) {
    //verificar que el usuario Chofer exista y este activo en db
    const actEmp = await this.verificarActivoEmpleado(viaje.empleado1);
    if (!actEmp) {
      throw new BadRequestException('El usuario seleccionado no es válido');
    }

    //verificar que el bus exista y este activo

    const busVerificar = await this.busService.existeBusActivoId(viaje.bus);
    if (!busVerificar) {
      throw new BadRequestException('No existe el bus');
    }

    //verificar que la ruta  y este activa
    const rutaVerificar = await this.rutaService.existeRutaActivaId(viaje.ruta);
    if (!rutaVerificar) {
      throw new BadRequestException('No existe la ruta');
    }

    //preguntar si el usuario que llega no está de viaje ya.
    const hoy = new Date(Date.now());

    // const tiempoVerificar = moment(hoy)
    //   .subtract(rutaVerificar.duracionAprox, 'hours')
    //   .format('YYYY-MM-DDTHH:mm');
    // const fechaVerificar = new Date(tiempoVerificar);

    const busDeViaje = await this.viajeModel.findOne({
      bus: viaje.bus,
      $expr: {
        // la siguiente es una expresión de agregación
        $and: [
          // indica que cada comparación entre elementos del array se debe satisfacer
          { $eq: [{ $year: '$fechaHoraSalida' }, { $year: hoy }] }, // devuelve true si se cumple la igualdad de loss elementos
          { $eq: [{ $month: '$fechaHoraSalida' }, { $month: hoy }] },
          { $eq: [{ $dayOfMonth: '$fechaHoraSalida' }, { $dayOfMonth: hoy }] },
        ],
      },
    });

    if (busDeViaje) {
      if (busDeViaje.fechaHoraLlegadaAprox > hoy) {
        throw new BadRequestException(
          `El bus elegido no puede salir de viaje aun`,
        );
      }
    }

    const empleadoDeViaje = await this.viajeModel.findOne({
      $expr: {
        // la siguiente es una expresión de agregación
        $and: [
          // indica que cada comparación entre elementos del array se debe satisfacer
          {
            $or: [
              { empleado1: viaje.empleado1 },
              { empleado2: viaje.empleado1 },
            ],
          },
          { $eq: [{ $year: '$fechaHoraSalida' }, { $year: hoy }] }, // devuelve true si se cumple la igualdad de loss elementos
          { $eq: [{ $month: '$fechaHoraSalida' }, { $month: hoy }] },
          { $eq: [{ $dayOfMonth: '$fechaHoraSalida' }, { $dayOfMonth: hoy }] },
          { $gte: ['$fechaHoraLlegadaAprox', hoy] },
        ],
      },
    });

    if (empleadoDeViaje) {
      throw new BadRequestException(`El empleado no puede salir de viaje aun`);
    }

    const data = await new this.viajeModel(viaje).save();

    //guardar la llegada aproximada del viaje
    const duracionAprox = moment(data.fechaHoraSalida)
      .add(rutaVerificar.duracionAprox, 'hours')
      .format('HH:mm');

    const fechaFijar = moment(data.fechaHoraSalida).format('YYYY-MM-DD');
    const guardar = `${fechaFijar} ${duracionAprox}`;
    data.fechaHoraLlegadaAprox = new Date(guardar);
    await data.save();

    //verificar si el usuario tiene suspensiones activas al momento del viaje y guardar el id
    const sus = await this.enviarCorreoPorSuspension(
      viaje.empleado1,
      actEmp.nombre,
      actEmp.apellido,
      data.fechaHoraSalida,
    );

    //guardar el id
    if (sus) {
      await data.suspensionActiva.push(sus._id);
      await data.save();
    }

    return data;
  }

  //agregar un ayudante al viaje
  async agregarEmpleado2(
    idViaje: FiltroViajeDto,
    idAyudante: AgregarEmpleado2Dto,
  ) {
    const { id } = idViaje;
    const { empleado2, tipoEmpleado2 } = idAyudante;

    const viaje = await this.viajeModel.findById({ _id: id });
    if (!viaje) {
      throw new NotFoundException('No existe el viaje');
    }

    //verificar que sea empleado activo
    const actEmp = await this.verificarActivoEmpleado(empleado2);

    if (!actEmp) {
      throw new BadRequestException('El empleado seleccionado no es válido');
    }

    //verificar que el ayudante no este registrado para este mismo viaje
    if (JSON.stringify(viaje.empleado1._id) === JSON.stringify(actEmp._id)) {
      throw new BadRequestException(
        'No puede registrar 2 veces al mismo empleado para este viaje',
      );
    }

    //verificar si el empleado 2 esta de viaje
    const hoy = viaje.fechaHoraSalida;
    console.log(hoy);
    const empleadoDeViaje = await this.viajeModel.findOne({
      $or: [{ empleado1: empleado2 }, { empleado2: empleado2 }],
      $expr: {
        // la siguiente es una expresión de agregación
        $and: [
          // indica que cada comparación entre elementos del array se debe satisfacer

          { $eq: [{ $year: '$fechaHoraSalida' }, { $year: hoy }] }, // devuelve true si se cumple la igualdad de loss elementos
          { $eq: [{ $month: '$fechaHoraSalida' }, { $month: hoy }] },
          { $eq: [{ $dayOfMonth: '$fechaHoraSalida' }, { $dayOfMonth: hoy }] },
          { $gte: ['$fechaHoraLlegadaAprox', hoy] },
        ],
      },
    });

    console.log(empleadoDeViaje);
    if (empleadoDeViaje) {
      throw new BadRequestException(`El empleado no puede salir de viaje aun`);
    }

    //  const fecha = moment(viaje.fechaHoraSalida).format('YYYY-MM-DD');

    //verificar si el usuario tiene suspensiones activas al momento del viaje y guardar el id
    const sus = await this.enviarCorreoPorSuspension(
      empleado2,
      actEmp.nombre,
      actEmp.apellido,
      viaje.fechaHoraSalida,
    );

    const data = await this.viajeModel.findByIdAndUpdate(
      id,
      { empleado2: empleado2, tipoEmpleado2: tipoEmpleado2 },
      { new: true },
    );

    if (sus) {
      await data.suspensionActiva.push(sus._id);
      await data.save();
    }

    return data;
  }

  //muestra todos los viajes activos o inactivos
  async listarTodo() {
    //   console.log(this.viajeModel.schema.paths);

    return this.viajeModel.find().exec();
  }

  async listarUno(idVi: FiltroViajeDto) {
    const { id } = idVi;
    const existe = await this.viajeModel.findById({ _id: id });

    if (!existe) {
      throw new NotFoundException('No existe el viaje');
    }

    return existe;
  }

  //listar viajes activos
  // async viajesActivo() {
  //   return this.viajeModel.find({ estado: true }).exec();
  // }

  // //elimina un viaje
  // async eliminar(idViaje: FiltroViajeDto) {
  //   const { id } = idViaje;
  //   const existe = await this.viajeModel.findById({ _id: id });

  //   if (!existe) {
  //     throw new NotFoundException('No existe el viaje');
  //   }

  //   const data = await this.viajeModel.findByIdAndUpdate(
  //     id,
  //     { estado: false },
  //     { new: true },
  //   );

  //   return data;
  // }

  //actualiza un viaje
  // async actualizar(idVi: FiltroViajeDto, viaje: ActualizarViajeDto) {
  //   const { id } = idVi;

  //   const existeId = await this.viajeModel.findOne({ _id: id });

  //   if (!existeId) {
  //     throw new NotFoundException(
  //       `No se puede actualizar porque no existe viaje con id: ${id}`,
  //     );
  //   }

  //   if (viaje.empleado1) {
  //     const actEmp = await this.verificarActivoEmpleado(viaje.empleado1);
  //     if (!actEmp) {
  //       throw new BadRequestException('El usuario seleccionado no es válido');
  //     }
  //   }

  //   if (viaje.empleado2) {
  //     const actEmpAyu = await this.verificarActivoEmpleado(viaje.empleado2);
  //     if (!actEmpAyu) {
  //       throw new BadRequestException('El usuario seleccionado no es válido');
  //     }
  //   }
  //   const data = await this.viajeModel.findByIdAndUpdate(
  //     id,
  //     { $set: viaje },
  //     { new: true },
  //   );

  //   data.fechaHoraSalida = new Date();
  //   data.save();
  //   return data;
  // }

  //*********************************************/
  //**REPORTES** */
  //muestra los viajes de un usuario id
  async viajePorUsuario(idUs: FiltroViajeDto) {
    const { id } = idUs;
    const usExiste = await this.usuarioService.existeUsuarioIdRetUs(id);
    if (!usExiste) {
      throw new BadRequestException('No existe el usuario');
    }

    const data = await this.viajeModel.count().find({
      $or: [{ empleado1: usExiste._id }, { empleado2: usExiste._id }],
    });

    return data;
  }

  async viajesPorFecha(params: FiltroFechaDto) {
    const filters: FilterQuery<Viaje> = {};
    const { desde, hasta } = params;
    //filters.inicio = { $gte: new Date(desde), $lt: new Date(hasta) };
    let busqueda = await this.viajeModel
      .find({
        fechaHoraSalida: { $gte: new Date(desde), $lte: new Date(hasta) },
      })
      .exec();

    return busqueda;
  }

  async viajesPorRuta(idRu: FiltroViajeDto) {
    const { id } = idRu;
    let busqueda = await this.viajeModel.find({ ruta: id }).exec();

    return busqueda;
  }

  async viajesPorUsuarioFecha(params: FiltroFechaDto, idUsu: FiltroViajeDto) {
    const filters: FilterQuery<Viaje> = {};
    const { desde, hasta } = params;
    const { id } = idUsu;
    //filters.inicio = { $gte: new Date(desde), $lt: new Date(hasta) };
    let busqueda = await this.viajeModel
      .find({
        $and: [
          { $or: [{ empleado1: id }, { empleado2: id }] },
          { fechaHoraSalida: { $gte: new Date(desde), $lte: new Date(hasta) } },
        ],
      })
      .exec();

    return busqueda;
  }

  async viajesPorRutaFecha(params: FiltroFechaDto, idRu: FiltroViajeDto) {
    const { desde, hasta } = params;
    const { id } = idRu;
    let busqueda = await this.viajeModel
      .find(
        { ruta: id },
        { fechaHoraSalida: { $gte: new Date(desde), $lte: new Date(hasta) } },
      )
      .exec();

    return busqueda;
  }

  //****TERMINAN LOS SERVICIOS DE REPORTES** */
  //*************************************************/

  async verificarActivoEmpleado(id: string) {
    //verificar que el usuario Chofer exista y este activo en db
    const usChofer = await this.usuarioService.existeUsuarioId(id);

    if (!usChofer) {
      throw new NotFoundException('No existe el usuario chofer');
    }

    const usChofActivo = await this.usuarioService.estadoActivoPorId(id);

    if (!usChofActivo) {
      throw new BadRequestException('No es un empleado activo');
    }

    //verifica que tenga un rol empleado
    if (!(await this.rolService.esRolSecretaria2(usChofer.rol._id))) {
      throw new BadRequestException('No es un usuario empleado');
    }

    return usChofer;
  }

  //si el chofer o el ayudante tienen suspensiones activas guarda el id para  mostrar la info del viaje
  async enviarCorreoPorSuspension(
    id: string,
    nomEmp: string,
    apeEmp: string,
    fecha: Date,
  ) {
    const susActiva = await this.suspensionService.suspensionActivaPorId(
      id,
      fecha,
    );

    if (susActiva) {
      const dat = susActiva._id;
      const secretaria = await this.usuarioService.esSecretaria();
      const administrador = await this.usuarioService.esAdministrador();

      const feInicio = moment(susActiva.inicio).format('DD-MM-YYYY');
      const feFinal = moment(susActiva.final).format('DD-MM-YYYY');
      const feformat = moment(fecha).format('DD-MM-YYYY');
      const horaFormat = moment(fecha).format('HH:mm');

      if (secretaria) {
        const correo = secretaria.correo;
        const nomSec = secretaria.nombre;

        const enviar = this.emailService.enviarCorreo(
          correo,
          nomSec,
          nomEmp,
          apeEmp,
          feInicio,
          feFinal,
          feformat,
          horaFormat,
        );
      }

      if (administrador) {
        const correo = administrador.correo;
        const nomAdm = administrador.nombre;

        const enviar = this.emailService.enviarCorreo(
          correo,
          nomAdm,
          nomEmp,
          apeEmp,
          feInicio,
          feFinal,
          feformat,
          horaFormat,
        );
      }
      return susActiva;
    }
    return false;
  }
}
