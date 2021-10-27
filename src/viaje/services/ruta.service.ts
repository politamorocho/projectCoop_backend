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
  constructor(
    @Inject('MONGO') private existeIdbaseMongo: Db,
    @InjectModel(Ruta.name) private rutaModel: Model<Ruta>,
  ) {}

  //crear un bus
  async crearRuta(ruta: CrearRutaDto) {
    const existeRuta = await this.rutaModel.findOne({
      origen: ruta.origen,
      destino: ruta.destino,
    });

    if (existeRuta) {
      throw new BadRequestException(
        `La ruta con origen ${existeRuta.origen} y destino ${existeRuta.destino} ya existe`,
      );
    }
    const datos = {
      origen: ruta.origen,
      destino: ruta.destino,
      estado: ruta.estado,
    };
    const data = await new this.rutaModel({ datos }).save();
    console.log('data', datos);
    return data;
  }

  //lista todas las rutas y activas o inactivas
  async listar(params?: FiltroRutaDto) {
    //si no viene ningun filtro,muestra todas las rutas
    let lista = await this.rutaModel.find().exec();

    if (params) {
      const { estado } = params;

      if (estado === 0) {
        lista = await this.rutaModel.find({ estado: false });
      }
      if (estado === 1) {
        lista = await this.rutaModel.find({ estado: true });
      }
    }

    return lista;
  }

  async buscarPorOrigenODestino(params: FiltroRutaDto) {
    //si no viene ningun filtro,muestra todas las rutas
    let data = await this.rutaModel.find().exec();

    const { lugar } = params;

    data = await this.rutaModel.find({
      $or: [
        { origen: { $regex: `^${lugar}`, $options: '$i' } },
        { destino: { $regex: `^${lugar}`, $options: '$i' } },
      ],
    });

    return data;
  }

  async actualizar(idRut: IdRutaDto, rutaAct: ActualizarRutaDto) {
    const { id } = idRut;
    const existeId = await this.rutaModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(
        `No se puede actualizar porque no existe ruta con id: ${id}`,
      );
    }

    if (!existeId.estado) {
      throw new BadRequestException(
        `no se puede actualizar la ruta porque es inactivo`,
      );
    }

    const data = await this.rutaModel.findByIdAndUpdate(
      id,
      { $set: rutaAct },
      { new: true },
    );
    return data;
  }

  async eliminar(idRut: IdRutaDto) {
    const { id } = idRut;
    const existeId = await this.rutaModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(`la ruta no existe`);
    }
    if (!existeId.estado) {
      throw new BadRequestException(`La ruta no esta activa`);
    }

    const data = await this.rutaModel.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );

    return data;
  }

  async existeRutaId(id: string) {
    const siExiste = await this.rutaModel.findById({ _id: id });

    if (!siExiste) {
      return false;
    }

    return true;
  }
}
