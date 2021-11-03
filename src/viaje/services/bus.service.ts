import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Model, FilterQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { Bus } from '../entities/bus.entity';
import {
  CrearBusDto,
  ActualizarBusDto,
  FiltroBusDto,
  IdBusDto,
} from '../dtos/bus.dto';

@Injectable()
export class BusService {
  constructor(
    
    @InjectModel(Bus.name) private busModel: Model<Bus>,
  ) {}

  //crear un bus
  async crearBus(bus: CrearBusDto) {
    console.log('esta llegando ', bus);
    const existePlaca = await this.busModel.findOne({ placa: bus.placa });

    if (existePlaca) {
      throw new BadRequestException(`El bus con placa: ${bus.placa} ya existe`);
    }
    //else {
    //   const datos = await new this.busModel(bus).save();
    //   console.log('data', datos);
    //   return datos;
    // }
    // const datos = {
    //   placa: bus.placa,
    //   numeroDisco: bus.numeroDisco,
    //   estado: bus.estado,
    // };

    const data = await new this.busModel(bus).save();

    console.log('data', data);
    return data;
  }

  async mostrarTodos() {
    const data = await this.busModel.find().exec();

    return data;
  }

  //listar todos los buses y separados por activos o inactivos
  async listar(params?: FiltroBusDto) {
    //si no hay parametros, lista todos los buses
    let busqueda = await this.busModel.find().exec();

    if (params) {
      const { estado } = params;

      if (estado === 1) {
        busqueda = await this.busModel.find({ estado: true });
      }

      if (estado === 0) {
        busqueda = await this.busModel.find({ estado: false });
      }
    }

    if (!busqueda) {
      throw new BadRequestException(`No existen buses`);
    }

    return busqueda;
  }

  //busca coinciencias en placa o numero
  async buscarPorPlacaONumero(params: FiltroBusDto) {
    const { placa, numeroDisco } = params;

    let data = await this.busModel.find({
      $or: [
        { placa: { $regex: `^${placa}`, $options: '$i' } },
        { numeroDisco: { $regex: `^${numeroDisco}`, $options: '$i' } },
      ],
    });

    if (!data) {
      throw new NotFoundException(`No existen coincidencias`);
    }

    // return data2;
    return data;
  }

  async actualizar(idBus: IdBusDto, busAct: ActualizarBusDto) {
    const { id } = idBus;
    const existeId = await this.busModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(
        `No se puede actualizar porque no existe bus con id: ${id}`,
      );
    }

    if (!existeId.estado) {
      throw new BadRequestException(
        `no se puede actualizar el bus  ${existeId.placa} porque es inactivo`,
      );
    }

    const data = await this.busModel.findByIdAndUpdate(
      id,
      { $set: busAct },
      { new: true },
    );
    return data;
  }

  async eliminar(idBus: IdBusDto) {
    const { id } = idBus;
    const existeId = await this.busModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(`el bus no existe`);
    }
    if (!existeId.estado) {
      throw new BadRequestException(`El bus no esta activo`);
    }

    const data = await this.busModel.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );

    return data;
  }

  async existeBusId(id: string) {
    const siExiste = await this.busModel.findById({ _id: id });

    if (!siExiste) {
      return false;
    }

    return true;
  }
}
