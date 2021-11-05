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

@Injectable()
export class ViajeService {
  constructor(
    @InjectModel(Viaje.name) private viajeModel: Model<Viaje>,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private busService: BusService,
    private rutaService: RutaService,
  ) {}

  //crear un viaje
  async crearViaje(viaje: CrearViajeDto) {
    console.log(viaje, 'viaje que se arma');
    //verificar que el usuario Chofer exista y este activo en db

    const actEmp = await this.verificarActivoEmpleado(viaje.usuChoferId);
    if (!actEmp) {
      throw new BadRequestException('El usuario seleccionado es invalido');
    }

    //verificar que el bus exista y este activo

    if (!this.busService.existeBusActivoId(viaje.bus)) {
      throw new BadRequestException('no existe bus con ese id');
    }

    //verificar que la ruta  y este activa
    if (!this.rutaService.existeRutaActivaId(viaje.ruta)) {
      throw new BadRequestException('no existe ruta con ese id');
    }

    const data = await new this.viajeModel(viaje).save();
    console.log('data', data);
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
      throw new NotFoundException('Elviaje es inactivo');
    }

    //verificar que sea empleadoactivo
    const actEmp = await this.verificarActivoEmpleado(usuAyudanteId);
    if (!actEmp) {
      throw new BadRequestException('El usuario seleccionado es invalido');
    }

    const data = await this.viajeModel.findByIdAndUpdate(
      id,
      { usuAyudanteId: usuAyudanteId },
      { new: true },
    );
    console.log('data', data);
    return data;
  }

  async listarTodo() {
    //   console.log(this.viajeModel.schema.paths);

    return this.viajeModel.find().exec();
  }

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
      throw new BadRequestException('no es usuario chofer activo');
    }

    //verifica que tenga un rol empleado
    if (!(await this.rolService.esRolEmpleado(usChofer.rol._id))) {
      throw new BadRequestException('No es un usuario empleado');
    }

    return true;
  }
}
