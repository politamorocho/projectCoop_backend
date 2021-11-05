import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { isMongoId } from 'class-validator';
import { Db } from 'mongodb';
import { Model, FilterQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Suspension } from '../entities/suspension.entity';
import { UsuarioService } from './usuario.service';
import { IdUsuarioDto } from '../dtos/usuario.dto';
import {
  CrearSuspensionDto,
  ActualizarSuspensionDto,
  FiltroSuspensionDto,
  IdSuspensionDto,
} from '../dtos/suspension.dto';

@Injectable()
export class SuspensionService {
  constructor(
    @InjectModel(Suspension.name) private suspensionModel: Model<Suspension>,
    private usuarioService: UsuarioService,
  ) {}

  //crea una suspension nueva
  async crearSuspension(suspension: CrearSuspensionDto) {
    if (!(await this.usuarioService.existeUsuarioId(suspension.usuario))) {
      throw new NotFoundException(
        'No existe el usuario al que le corresponde la suspension',
      );
    }

    if (!(await this.usuarioService.estadoActivoPorId(suspension.usuario))) {
      throw new BadRequestException('El usuario es inactivo');
    }

    const existeId = await new this.suspensionModel(suspension).save();

    this.inactivarSuspension(existeId._id);
    return existeId;
  }

  async inactivarSuspension(id: string) {
    const existeId = await this.suspensionModel.findById({ _id: id });
    const fechaHoy = new Date().toISOString();

    if (fechaHoy == existeId.final.toISOString()) {
      const estado = await this.suspensionModel.findByIdAndUpdate(
        id,
        { estado: false },
        { new: true },
      );

      //return existeId;
    }
  }

  async filtroActivaInactiva(query: FiltroSuspensionDto) {
    const { estado } = query;

    let busqueda;
    if (estado == 0) {
      busqueda = await this.suspensionModel.find({ estado: false }).exec();
      return busqueda;
    } else if (estado == 1) {
      busqueda = await this.suspensionModel.find({ estado: true }).exec();
      return busqueda;
    }

    return busqueda;
  }

  //muestra todas las suspensiones en db
  async mostrarTodas() {
    //console.log(new Date().toUTCString());
    const data = await this.suspensionModel
      .find()
      // .populate('Usuario', '-claveUsuario')
      .exec();
    // console.log(new Date().getDay());
    return data;
  }


  async mostrarUna(idSus: IdSuspensionDto ){
    const {id} = idSus;
    const data = await this.suspensionModel
    .findOne({_id:id});

    if(!data){
      throw new NotFoundException('No existe suspension con ese id')
    }

    return data;

  }

  //mostrar listado de suspensiones activos o inactivas por rango de fecha
  // async activasPorFecha(params: FiltroSuspensionDto) {
  //   const filters: FilterQuery<Suspension> = {};
  //   const { estado, desde, hasta } = params;

  //   if (estado) {
  //     if (estado == 0) {
  //       const act = await this.suspensionModel
  //         .find({ estado: false })
  //         .populate('usuario', '-__v')
  //         .exec();
  //       return act;
  //     }

  //     if (estado == 1) {
  //       const inc = await this.suspensionModel
  //         .find({ estado: true })
  //         .populate('usuario', '-__v')
  //         .exec();

  //       return inc;
  //     }
  //   }

  //   if (estado && desde) {
  //     if (estado == 0) {
  //       const bus1 = await this.suspensionModel
  //         .find({ inicio: desde }, { estado: false })
  //         .populate('usuario', '-__v')
  //         .exec();
  //       return bus1;
  //     }
  //     if (estado == 1) {
  //       const bus2 = await this.suspensionModel
  //         .find({ inicio: desde }, { estado: true })
  //         .populate('usuario', '-__v')
  //         .exec();

  //       return bus2;
  //     }
  //   }

  //   if (estado && desde && hasta) {
  //     if (estado == 0) {
  //       const bus3 = await this.suspensionModel
  //         .find({ inicio: desde, final: hasta, estado: false })
  //         .populate('usuario', '-__v')
  //         .exec();
  //       return bus3;
  //     }
  //     if (estado == 1) {
  //       const bus4 = await this.suspensionModel
  //         .find({ estado: true, final: hasta, inicio: desde })
  //         .populate('usuario', '-__v')
  //         .exec();
  //       return bus4;
  //     }
  //   }
  // }

  //Muestra todas las suspensiones de un usuario por id enviado por query
  async susPorUsuario(idUs: IdUsuarioDto) {
    const { id } = idUs;
    if (!this.usuarioService.existeUsuarioId(id)) {
      throw new BadRequestException('El usuario no existe');
    }

    let existeId = await this.suspensionModel.find({ usuario: id }).exec();

    if (!existeId) {
      throw new BadRequestException('No hay suspensiones para ese usuario');
    }

    return existeId;
  }

  //muestra las suspensiones activas=1 o inactivas=0 por usuario id enviada por query
  async filtroActivaInactivaPorUsuario(
    idUs: IdUsuarioDto,
    params: FiltroSuspensionDto,
  ) {
    const { id } = idUs;

    if (!this.usuarioService.existeIdPorDto(idUs)) {
      throw new NotFoundException('El usuario no existe');
    }

    if (!this.suspensionModel.find({ usuario: id })) {
      throw new BadRequestException('No hay suspensiones para ese usuario');
    }

    const { estado } = params;

    let busqueda;
    if (estado == 0) {
      busqueda = await this.suspensionModel
        .find({ estado: false, usuario: id })
        .exec();
      return busqueda;
    } else if (estado == 1) {
      busqueda = await this.suspensionModel
        .find({ estado: true, usuario: id })
        .exec();
      return busqueda;
    }
    return busqueda;
  }

  //Muestra las suspensiones de un usuario por id, en rango  por fecha de creacioon
  async susPorUsuarioFecha(idUs: IdUsuarioDto, params: FiltroSuspensionDto) {
    const { id } = idUs;

    if (!this.usuarioService.existeIdPorDto(idUs)) {
      throw new NotFoundException('El usuario no existe');
    }

    if (!this.suspensionModel.find({ usuario: id })) {
      throw new BadRequestException('No hay suspensiones para ese usuario');
    }

    const filters: FilterQuery<Suspension> = {};
    const { desde, hasta } = params;
    //filters.inicio = { $gte: new Date(desde), $lt: new Date(hasta) };
    let busqueda = await this.suspensionModel
      .find({
        inicio: { $gte: new Date(desde), $lte: new Date(hasta) },
        usuario: id,
      })
      .exec();

    return busqueda;
  }

  //eliminar suspension por id enviado en query
  async eliminar(idSus: IdSuspensionDto) {
    const { id } = idSus;
    const existeId = await this.suspensionModel.findOne({ _id: id }).exec();
    if (!existeId) {
      throw new NotFoundException(`la suspension con id: ${id} no existe`);
    }

    if (!existeId.estado) {
      throw new BadRequestException(
        `la suspension con id: ${id} ya esta inactiva`,
      );
    }
    const data = await this.suspensionModel.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );
    return data;
  }

  async actualizar(idSus: IdSuspensionDto, susActual: ActualizarSuspensionDto) {
    const { id } = idSus;
    const existeId = await this.suspensionModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(
        `No se puede actualizar porque no existe suspension con id: ${id}`,
      );
    }

    if (!existeId.estado) {
      throw new BadRequestException(
        `no se puede actualizar la suspension  ${existeId._id} porque es inactiva`,
      );
    }

    const data = await this.suspensionModel.findByIdAndUpdate(
      id,
      { $set: susActual },
      { new: true },
    );
    return data;
  }
}
