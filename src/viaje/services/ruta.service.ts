import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Model, FilterQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { Ruta } from '../entities/ruta.entity';
import {
  CrearRutaDto,
  ActualizarRutaDto,
  FiltroRutaDto,
  IdRutaDto,
} from '../dtos/ruta.dto';

@Injectable()
export class RutaService {
  constructor(@InjectModel(Ruta.name) private rutaModel: Model<Ruta>) {}

  //crear un ruta
  async crearRuta(ruta: CrearRutaDto) {
    if (ruta.origen.toLowerCase() == ruta.destino.toLowerCase()) {
      throw new BadRequestException(
        `La ruta no puede tener el mismo origen y destino`,
      );
    }

    const existeRuta = await this.rutaModel.findOne({
      origen: ruta.origen,
      destino: ruta.destino,
    });

    if (existeRuta) {
      throw new BadRequestException(
        `La ruta con origen ${existeRuta.origen} y destino ${existeRuta.destino} ya existe`,
      );
    }

    const data = await new this.rutaModel(ruta).save();

    return data;
  }

  //lista todas las rutas y activas o inactivas
  async mostrarTodo() {
    const data = await this.rutaModel.find().exec();
    return data;
  }

  async soloActivos() {
    let data = await this.rutaModel.find({ estado: true }).exec();
    return data;
  }

  //la info de una ruta por id enviado por query
  async mostrarUno(idRuta: IdRutaDto) {
    const { id } = idRuta;
    const data = await this.rutaModel.findOne({ _id: id }).exec();

    if (!data) {
      throw new BadRequestException('No existe la ruta');
    }
    return data;
  }

  //filtra rutas activas=1 o inactivas=0, por estado enviado por query
  async filtrarActivaInactiva(params: FiltroRutaDto) {
    let lista;

    const { estado } = params;

    if (estado == 0) {
      lista = await this.rutaModel.find({ estado: false });
      return lista;
    }
    if (estado == 1) {
      lista = await this.rutaModel.find({ estado: true });
      return lista;
    }

    // return lista;
  }

  //busca rutas coincidentes por origen o destino
  async buscarPorOrigenODestino(params: FiltroRutaDto) {
    //si no viene ningun filtro,muestra todas las rutas
    let data = await this.rutaModel.find().exec();

    const { lugar } = params;

    data = await this.rutaModel.find({
      $and: [
        { estado: true },
        {
          $or: [
            { origen: { $regex: `^${lugar}`, $options: '$i' } },
            { destino: { $regex: `^${lugar}`, $options: '$i' } },
          ],
        },
      ],
    });

    return data;
  }

  //actualiza una ruta
  async actualizar(idRut: IdRutaDto, rutaAct: ActualizarRutaDto) {
    const { id } = idRut;
    const existeId = await this.rutaModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(
        `No se puede actualizar porque no existe ruta`,
      );
    }

    if (!existeId.estado) {
      throw new BadRequestException(
        `No se puede actualizar porque no existe ruta`,
      );
    }

    const existeYa = await this.rutaModel.findOne({
      origen: rutaAct.origen,
      destino: rutaAct.destino,
    });
    if (existeYa) {
      throw new BadRequestException(
        `La ruta con origen: ${rutaAct.origen} y destino: ${rutaAct.destino} ya existe`,
      );
    }

    const data = await this.rutaModel.findByIdAndUpdate(
      id,
      { $set: rutaAct },
      { new: true },
    );
    return data;
  }

  //elimina una ruta
  async eliminar(idRut: IdRutaDto) {
    const { id } = idRut;
    const existeId = await this.rutaModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(`la ruta no existe`);
    }
    if (!existeId.estado) {
      throw new BadRequestException(`La ruta no está activa`);
    }

    const data = await this.rutaModel.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );

    return data;
  }

  async existeRutaActivaId(id: string) {
    const siExiste = await this.rutaModel.findById({ _id: id });

    if (!siExiste) {
      return false;
    }

    if (!siExiste.estado) {
      return false;
    }

    return siExiste;
  }
}
