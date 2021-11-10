import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Model, FilterQuery } from 'mongoose';
const mongoose = require('mongoose');
import { InjectModel } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { Viaje } from '../entities/viaje.entity';
import {
  CrearViajeDto,
  FiltroViajeDto,
  ActualizarViajeDto,
  AgregarAyudanteViajeDto,
} from '../dtos/viaje.dto';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { BusService } from './bus.service';
import { RutaService } from './ruta.service';
import { FiltroUsuarioDto, IdUsuarioDto } from 'src/usuario/dtos/usuario.dto';
import { Bus } from '../entities/bus.entity';
import { RolService } from 'src/usuario/services/rol.service';
import { SuspensionService } from 'src/usuario/services/suspension.service';
import { EmailService } from '../../email/services/email.service';

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

    const actEmp = await this.verificarActivoEmpleado(viaje.usuChoferId);
    if (!actEmp) {
      throw new BadRequestException('El usuario seleccionado es invalido');
    }

    //verificar que el bus exista y este activo

    if (!(await this.busService.existeBusActivoId(viaje.bus))) {
      throw new BadRequestException('no existe bus con ese id');
    }

    //verificar que la ruta  y este activa
    if (!(await this.rutaService.existeRutaActivaId(viaje.ruta))) {
      throw new BadRequestException('no existe ruta con ese id');
    }

    const data = await new this.viajeModel(viaje).save();

    //verificar si el usuario tiene suspensiones activas al momento del viaje y guardar el id
    const sus = await this.enviarCorreoPorSuspension(
      viaje.usuChoferId,
      actEmp.nombre,
      actEmp.apellido,
    );

    //guardar el id
    if (sus) {
      await data.suspensionActiva.push(sus._id);
      await data.save();
      // await this.viajeModel.findByIdAndUpdate(
      //   data._id,
      //   { suspensionActiva: sus._id },
      //   { new: true },
      // );
      // data.suspensionActiva = sus._id;
    }
    //const data = new this.viajeModel(viaje).save();

    return data;
  }

  //agregar un ayudante al viaje
  async agregarAyudante(
    idViaje: FiltroViajeDto,
    idAyudante: AgregarAyudanteViajeDto,
  ) {
    const { id } = idViaje;
    const { usuAyudanteId } = idAyudante;

    const viaje = await this.viajeModel.findById({ _id: id });
    if (!viaje) {
      throw new NotFoundException('No existe viaje con ese id');
    }

    if (!viaje.estado) {
      throw new NotFoundException('El viaje es inactivo');
    }

    //verificar que sea empleadoactivo
    const actEmp = await this.verificarActivoEmpleado(usuAyudanteId);
    if (!actEmp) {
      throw new BadRequestException('El usuario seleccionado es invalido');
    }

    //verificar que el ayudante no este registrado para este mismo viaje
    if (viaje.usuChoferId === actEmp._id) {
      throw new BadRequestException(
        'No puede registrar 2 veces al mismo usuario para este viaje',
      );
    }

    //verificar si el usuario tiene suspensiones activas al momento del viaje y guardar el id
    const sus = await this.enviarCorreoPorSuspension(
      usuAyudanteId,
      actEmp.nombre,
      actEmp.apellido,
    );

    const data = await this.viajeModel.findByIdAndUpdate(
      id,
      { usuAyudanteId: usuAyudanteId },
      { new: true },
    );

    if (sus) {
      await data.suspensionActiva.push(sus._id);
      // const data = await this.viajeModel.findByIdAndUpdate(
      //   id,
      //   { suspensionActiva: sus._id },
      //   { new: true },
      // );
      await data.save();
    }

    return data;
  }

  //muestra todos los viajes activos o inactivos
  async listarTodo() {
    //   console.log(this.viajeModel.schema.paths);

    return this.viajeModel.find().exec();
  }

  //elimina un viaje
  async eliminar(idViaje: FiltroViajeDto) {
    const { id } = idViaje;
    const existe = await this.viajeModel.findById({ _id: id });

    if (!existe) {
      throw new NotFoundException('No existe viaje con ese id');
    }

    const data = await this.viajeModel.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );

    return data;
  }

  //muestra los viajes de un usuario id
  async viajePorUsuario(idUs: FiltroViajeDto) {
    const { id } = idUs;
    const usExiste = await this.usuarioService.existeUsuarioIdRetUs(id);
    if (!usExiste) {
      throw new BadRequestException('No existe el usuario');
    }

    const data = await this.viajeModel.count().find({
      $or: [{ usuChoferId: usExiste._id }, { usuAyudanteId: usExiste._id }],
    });

    return data;
  }

  //actualiza un viaje
  async actualizar(idVi: FiltroViajeDto, viaje: ActualizarViajeDto) {
    const { id } = idVi;

    const existeId = await this.viajeModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(
        `No se puede actualizar porque no existe viaje con id: ${id}`,
      );
    }

    if (!existeId.estado) {
      throw new BadRequestException(
        `no se puede actualizar el viaje porque es inactivo`,
      );
    }

    if (viaje.usuChoferId) {
      const actEmp = await this.verificarActivoEmpleado(viaje.usuChoferId);
      if (!actEmp) {
        throw new BadRequestException('El usuario seleccionado es invalido');
      }
    }

    if (viaje.usuAyudanteId) {
      const actEmpAyu = await this.verificarActivoEmpleado(viaje.usuAyudanteId);
      if (!actEmpAyu) {
        throw new BadRequestException('El usuario seleccionado es invalido');
      }
    }
    const data = await this.viajeModel.findByIdAndUpdate(
      id,
      { $set: viaje },
      { new: true },
    );
    return data;
  }

  async verificarActivoEmpleado(id: string) {
    //verificar que el usuario Chofer exista y este activo en db
    const usChofer = await this.usuarioService.existeUsuarioId(id);

    if (!usChofer) {
      throw new NotFoundException('No existe usuario chofer con ese id');
    }

    const usChofActivo = await this.usuarioService.estadoActivoPorId(id);

    if (!usChofActivo) {
      throw new BadRequestException('no es usuario empleado activo');
    }

    //verifica que tenga un rol empleado
    if (!(await this.rolService.esRolEmpleado(usChofer.rol._id))) {
      throw new BadRequestException('No es un usuario empleado');
    }

    return usChofer;
  }

  //si el chofer o el ayudante tienen suspensiones activas guarda el id para  mostrar la info del viaje
  async enviarCorreoPorSuspension(id: string, nomEmp: string, apeEmp: string) {
    const susActiva = await this.suspensionService.suspensionActivaPorId(id);

    if (susActiva) {
      const dat = susActiva._id;
      const secretaria = await this.usuarioService.esSecretaria();
      const administrador = await this.usuarioService.esAdministrador();

      if (secretaria) {
        const correo = secretaria.correo;
        const nomSec = secretaria.nombre;
        const empNombre = nomEmp;
        const empApellido = apeEmp;

        const enviar = this.emailService.enviarCorreo(
          correo,
          nomSec,
          empNombre,
          empApellido,
        );
      }

      if (administrador) {
        const correo = administrador.correo;
        const nomAdm = administrador.nombre;
        const empNombre = nomEmp;
        const empApellido = apeEmp;

        const enviar = this.emailService.enviarCorreo(
          correo,
          nomAdm,
          empNombre,
          empApellido,
        );
      }
      return susActiva;
    }
    return false;
  }
}
