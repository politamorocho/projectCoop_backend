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
import * as moment from 'moment';
import { Suspension } from '../entities/suspension.entity';
import { UsuarioService } from './usuario.service';
import { IdDto } from '../dtos/usuario.dto';
import {
  CrearSuspensionDto,
  ActualizarSuspensionDto,
  FiltroFechaDto,
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
    const ini = moment(suspension.inicio).format('YYYY-MM-DD');
    const fin = moment(suspension.final).format('YYYY-MM-DD');

    if (ini > fin || fin < ini) {
      throw new BadRequestException('Revise las fechas, son inválidas');
    }

    if (!(await this.usuarioService.existeUsuarioId(suspension.usuario))) {
      throw new NotFoundException('No existe el usuario');
    }

    if (!(await this.usuarioService.estadoActivoPorId(suspension.usuario))) {
      throw new BadRequestException('El usuario está inactivo');
    }

    suspension.descripcion = this.cambiarMinusculas(suspension.descripcion);
    const existeId = await new this.suspensionModel(suspension).save();

    //this.inactivarSuspension(existeId._id);
    return existeId;
  }

  //inactivar automaticamente la suspension cuando se cumpla la fecha final, no se usa
  async inactivarSuspension(id: string) {
    const existeId = await this.suspensionModel.findById({ _id: id });

    const hoy = moment().format('YYYY-MM-DD');
    const fin = moment(existeId.final).format('YYYY-MM-DD');

    if (hoy > fin) {
      const estado = await this.suspensionModel.findByIdAndUpdate(
        id,
        { estado: false },
        { new: true },
      );

      //return existeId;
    }
  }

  //muestra todas las suspensiones en db
  async mostrarTodas() {
    const data = await this.suspensionModel.find().exec();
    return data;
  }

  //info de uuna suspension por id enviado al query
  async mostrarUna(idSus: IdSuspensionDto) {
    const { id } = idSus;
    const data = await this.suspensionModel.findOne({ _id: id });

    if (!data) {
      throw new NotFoundException('No existe una suspension');
    }

    return data;
  }

  //suspensiones de usuario por id enviado por query
  async susPorUsuario(idUs: IdDto) {
    const { id } = idUs;
    if (!this.usuarioService.existeUsuarioId(id)) {
      throw new BadRequestException('El usuario no existe');
    }

    let existeId = await this.suspensionModel.find({ usuario: id }).exec();

    if (!existeId) {
      throw new BadRequestException(
        'No hay suspensiones para el usuario elegido',
      );
    }

    return existeId;
  }

  async suspensionesPorRango(rango: FiltroFechaDto) {
    const { desde, hasta } = rango;

    const filters: FilterQuery<Suspension> = {};

    // filters.inicio = { $gte: desde1, $lt: hasta1 };
    let busqueda = await this.suspensionModel
      .find({
        inicio: { $gte: new Date(desde), $lte: new Date(hasta) },
        //usuario: id,
      })
      .exec();

    return busqueda;
  }

  // //Muestra las suspensiones de un usuario por id, en rango  por fecha de creacioon
  async susPorUsuarioFecha(idUs: IdDto, params: FiltroFechaDto) {
    const { id } = idUs;

    if (!this.usuarioService.existeIdPorDto(idUs)) {
      throw new NotFoundException('El usuario no existe');
    }

    if (!this.suspensionModel.find({ usuario: id })) {
      throw new BadRequestException(
        'No hay suspensiones para el usuario elegido',
      );
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

  // eliminar suspension por id enviado en query
  // async eliminar(idSus: IdSuspensionDto) {
  //   const { id } = idSus;
  //   const existeId = await this.suspensionModel.findOne({ _id: id }).exec();
  //   if (!existeId) {
  //     throw new NotFoundException(`la suspension con id: ${id} no existe`);
  //   }

  //   if (!existeId.estado) {
  //     throw new BadRequestException(
  //       `la suspension con id: ${id} ya esta inactiva`,
  //     );
  //   }
  //   const data = await this.suspensionModel.findByIdAndUpdate(
  //     id,
  //     { estado: false },
  //     { new: true },
  //   );
  //   return data;
  // }

  //actualizar una suspension
  async actualizar(idSus: IdSuspensionDto, susActual: ActualizarSuspensionDto) {
    const { id } = idSus;
    const existeId = await this.suspensionModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(
        `No se puede actualizar porque no existe la suspensión`,
      );
    }

    // const verificar = moment(fecha).format('YYYY-MM-DD HH:mm:ss');
    const iniSusAct = moment(susActual.inicio).format('YYYY-MM-DD');
    const finSusAct = moment(susActual.final).format('YYYY-MM-DD');
    const iniExisteId = moment(existeId.inicio).format('YYYY-MM-DD');
    const finExisteId = moment(existeId.final).format('YYYY-MM-DD');

    if (susActual.inicio && susActual.final) {
      if (susActual.inicio !== existeId.inicio) {
        if (iniSusAct > finSusAct) {
          throw new BadRequestException('Verifique las fechas por favor');
        }
        if (susActual.final !== existeId.final) {
          if (finSusAct < iniSusAct) {
            throw new BadRequestException('Verifique las fechas por favor');
          }
        }
      }
    }

    susActual.descripcion = this.cambiarMinusculas(susActual.descripcion);
    const data = await this.suspensionModel.findByIdAndUpdate(
      id,
      { $set: susActual },
      { new: true },
    );
    return data;
  }

  //verifica si hay suspensiones activas de un usuario Id en una fecha enviada
  async suspensionActivaPorId(idUsuario: string, fecha: Date) {
    const existe = await this.suspensionModel.findOne({ usuario: idUsuario });

    //console.log('estoooo ', existe);
    if (!existe) {
      return false;
    }

    const verificar = moment(fecha).format('YYYY-MM-DD');
    const inicio = moment(existe.inicio).format('YYYY-MM-DD ');
    const fin = moment(existe.final).format('YYYY-MM-DD');
    //  console.log('fechas que manejo', verificar, inicio, fin);

    if (verificar < inicio) {
      return false;
    }
    if (verificar > fin) {
      return false;
    }

    if (verificar == inicio || verificar == fin) {
      console.log(existe);
      return existe;
    }

    if (verificar > inicio && verificar < fin) {
      return existe;
    }
  }

  cambiarMinusculas(palabra: string) {
    const nueva = palabra.toLowerCase();
    return nueva;
  }
}
