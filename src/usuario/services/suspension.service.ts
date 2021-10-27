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
    @Inject('MONGO') private existeIdbaseMongo: Db,
    @InjectModel(Suspension.name) private suspensionModel: Model<Suspension>,
    private usuarioService: UsuarioService,
  ) {}

  async crearSuspension(suspension: CrearSuspensionDto) {
    const existeId = await new this.suspensionModel(suspension).save();
    console.log('existeId...', existeId);

    this.inactivarSuspension(existeId._id);
    return existeId;
  }

  async inactivarSuspension(id: string) {
    const existeId = await this.suspensionModel.findById({ _id: id });
    const fechaHoy = new Date();

    if (fechaHoy === existeId.final) {
      existeId.estado = false;
    }
  }

  //mostrar listado de suspensiones activos o inactivas por rango de fecha
  async activasPorFecha(params?: FiltroSuspensionDto) {
    //si no manda ningun parametro, muestra todas las suspensiones.
    let existeId = await this.suspensionModel
      .find()
      .populate('usuario', '-__v')
      .exec();

    //si hay parametros
    if (params) {
      const filters: FilterQuery<Suspension> = {};
      const { estado, desde, hasta } = params;

      if (estado) {
        if (estado == 0) {
          existeId = await this.suspensionModel
            .find({ estado: false })
            // .populate('usuario', '-__v')
            .exec();
        }

        if (estado == 1) {
          existeId = await this.suspensionModel
            .find({ estado: true })
            // .populate('usuario', '-__v')
            .exec();
        }
        return existeId;
      }

      if (estado && desde) {
        if (estado == 0) {
          existeId = await this.suspensionModel
            .find({ inicio: desde }, { estado: false })
            .populate('usuario', '-__v')
            .exec();
        }
        if (estado == 1) {
          existeId = await this.suspensionModel
            .find({ inicio: desde }, { estado: true })
            .populate('usuario', '-__v')
            .exec();
        }

        return existeId;
      }

      if (estado && desde && hasta) {
        if (estado == 0) {
          existeId = await this.suspensionModel
            .find({ inicio: desde, final: hasta, estado: false })
            .populate('usuario', '-__v')
            .exec();
        }
        if (estado == 1) {
          existeId = await this.suspensionModel
            .find({ estado: true, final: hasta, inicio: desde })
            .populate('usuario', '-__v')
            .exec();
        }
        return existeId;
      }
    }

    return existeId;
  }

  async listarPorUsuario(idUs: IdUsuarioDto, params?: FiltroSuspensionDto) {
    const { id } = idUs;

    if (!this.usuarioService.existeIdPorDto(idUs)) {
      throw new NotFoundException('El usuario no existe');
    }

    let existeId = await this.suspensionModel
      .find({ usuario: id })
      .populate('usuario', '-__v')
      .exec();

    if (params) {
      const filters: FilterQuery<Suspension> = {};
      const { estado, desde, hasta } = params;

      if (estado) {
        if (estado === 0) {
          existeId = await this.suspensionModel
            .find({ estado: false }, { usuario: id })
            .populate('usuario', '-__v')
            .exec();
        } else if (estado === 1) {
          existeId = await this.suspensionModel
            .find({ estado: true }, { usuario: id })
            .populate('usuario', '-__v')
            .exec();
        }
        return existeId;
      }

      if (estado && desde) {
        if (estado == 0) {
          existeId = await this.suspensionModel
            .find({ inicio: desde }, { estado: false }, { usuario: id })
            .populate('usuario', '-__v')
            .exec();
        }
        if (estado == 1) {
          existeId = await this.suspensionModel
            .find({ inicio: desde }, { estado: true }, { usuario: id })
            .populate('usuario', '-__v')
            .exec();
        }
        return existeId;
      }

      if (estado && desde && hasta) {
        if (estado == 0) {
          existeId = await this.suspensionModel
            .find({ inicio: desde, final: hasta, estado: false, usuario: id })
            .populate('usuario', '-__v')
            .exec();
        }
        if (estado == 1) {
          existeId = await this.suspensionModel
            .find({ estado: true, final: hasta, inicio: desde, usuario: id })
            .populate('usuario', '-__v')
            .exec();
        }
        return existeId;
      }
    }
    return existeId;
  }

  async eliminarSus(idSus: IdSuspensionDto) {
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
