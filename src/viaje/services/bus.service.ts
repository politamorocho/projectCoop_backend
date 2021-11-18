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
  constructor(@InjectModel(Bus.name) private busModel: Model<Bus>) {}

  //crear un bus
  async crearBus(bus: CrearBusDto) {
    //  console.log('esta llegando ', bus);
    const existePlaca = await this.busModel.findOne({ placa: bus.placa });

    if (existePlaca) {
      throw new BadRequestException(`El bus con placa: ${bus.placa} ya existe`);
    }

    const numDisco = await this.busModel.findOne({
      numeroDisco: bus.numeroDisco,
    });
    if (numDisco) {
      throw new BadRequestException(
        `El bus con numero de disco: ${bus.numeroDisco} ya existe`,
      );
    }

    const data = await new this.busModel(bus).save();

    console.log('data', data);
    return data;
  }

  //muestra todos los buses en db
  async mostrarTodo() {
    const data = await this.busModel.find().exec();

    return data;
  }

  //mostrar solo activos
  async soloActivos() {
    let data = await this.busModel.find({ estado: true }).exec();
    return data;
  }

  //mostrar la info de un bus enviado el id por query
  async mostrarUno(idBus: IdBusDto) {
    const { id } = idBus;
    if (!(await this.busModel.findById(id))) {
      throw new NotFoundException('No existe el bus');
    }

    const data = await this.busModel.findOne({ _id: id });
    return data;
  }

  //listar todos los buses y separados por activos=1 o inactivos=0
  async listar(params: FiltroBusDto) {
    let busqueda;

    const { estado } = params;

    if (estado == 1) {
      busqueda = await this.busModel.find({ estado: true });
      return busqueda;
    }

    if (estado == 0) {
      busqueda = await this.busModel.find({ estado: false });
      return busqueda;
    }

    return busqueda;
  }

  //busca coinciencias en placa o numero
  async buscarPorPlacaONumero(params: FiltroBusDto) {
    const { placa, numeroDisco } = params;

    let data;
    if (placa) {
      data = await this.busModel.find({
        placa: { $regex: `^${placa}`, $options: '$i' },
      });
      return data;
    }

    if (numeroDisco) {
      data = await this.busModel.find({
        numeroDisco: { $regex: `^${numeroDisco}`, $options: '$i' },
      });
      return data;
    }

    return data;
  }

  async actualizar(idBus: IdBusDto, busAct: ActualizarBusDto) {
    const { id } = idBus;
    const existeId = await this.busModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(
        `No se puede actualizar porque no existe el bus`,
      );
    }

    if (!existeId.estado) {
      throw new BadRequestException(
        `No se puede actualizar porque no existe el bus`,
      );
    }

    if (busAct.placa) {
      if (busAct.placa !== existeId.placa) {
        const existePlaca = await this.busModel.findOne({
          placa: busAct.placa,
        });
        if (existePlaca) {
          throw new BadRequestException(
            `El bus con placa: ${busAct.placa} ya existe`,
          );
        }
      }
    }

    if (busAct.numeroDisco) {
      if (busAct.numeroDisco !== existeId.numeroDisco) {
        const numDisco = await this.busModel.findOne({
          numeroDisco: busAct.numeroDisco,
        });
        if (numDisco) {
          throw new BadRequestException(
            `El bus con numero de disco: ${busAct.numeroDisco} ya existe`,
          );
        }
      }
    }

    const data = await this.busModel.findByIdAndUpdate(
      id,
      { $set: busAct },
      { new: true },
    );
    return data;
  }

  //elimina un bus
  async eliminar(idBus: IdBusDto) {
    const { id } = idBus;
    const existeId = await this.busModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(`el bus no existe`);
    }
    if (!existeId.estado) {
      throw new BadRequestException(`El bus no está activo`);
    }

    const data = await this.busModel.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );

    return data;
  }

  async existeBusActivoId(id: string) {
    const siExiste = await this.busModel.findById({ _id: id });

    if (!siExiste) {
      return false;
    }

    if (!siExiste.estado) {
      return false;
    }

    return true;
  }
}
