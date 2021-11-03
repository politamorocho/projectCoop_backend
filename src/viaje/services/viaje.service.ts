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
import { CrearViajeDto, FiltroViajeDto } from '../dtos/viaje.dto';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { BusService } from './bus.service';
import { RutaService } from './ruta.service';
import { FiltroUsuarioDto } from 'src/usuario/dtos/usuario.dto';
import { Bus } from '../entities/bus.entity';

@Injectable()
export class ViajeService {
  constructor(
    @InjectModel(Viaje.name) private viajeModel: Model<Viaje>,
    private usuarioService: UsuarioService,
    private busService: BusService,
    private rutaService: RutaService,
  ) {}

  //crear un viaje
  async crearViaje(viaje: CrearViajeDto) {
    if (!this.usuarioService.existeUsuarioId(viaje.usuChoferId)) {
      throw new BadRequestException('no existe usuario con ese id');
    }

    if (!this.usuarioService.existeUsuarioId(viaje.usuAyudanteId)) {
      throw new BadRequestException('no existe usuario con ese id');
    }

    if (!this.busService.existeBusId(viaje.bus)) {
      throw new BadRequestException('no existe bus con ese id');
    }

    if (!this.rutaService.existeRutaId(viaje.ruta)) {
      throw new BadRequestException('no existe ruta con ese id');
    }

    const data = await new this.viajeModel({ viaje }).save();
    console.log('data', data);
    return data;
  }

  async listarTodo() {
    //  console.log(this.viajeModel.schema.paths);

    return this.viajeModel.find().exec();
  }

  async eliminar(id: string) {
    const existe = await this.viajeModel.findById({ _id: id });

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

    const data = await this.viajeModel.aggregate([
      {
        $match: {
          $or: [{ usuChoferId: usExiste._id }, { usuAyudanteId: usExiste._id }],
        },
      },
      {
        $lookup: {
          from: 'buses',
          localField: 'bus',
          foreignField: '_id',
          as: 'bus',
        },
      },
      {
        $lookup: {
          from: 'rutas',
          localField: 'ruta',
          foreignField: '_id',
          as: 'ruta',
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'usuChoferId',
          foreignField: '_id',
          as: 'usuChoferId',
        },
      },
      {
        $lookup: {
          from: 'usuarios',
          localField: 'usuAyudanteId',
          foreignField: '_id',
          as: 'usuAyudanteId',
        },
      },
      {
        $lookup: {
          from: 'rols',
          localField: 'usuAyudanteId._id',
          foreignField: 'nombre',
          as: 'usuAyudanteId._id',
        },
      },
      { $unwind: '$bus' },
      { $unwind: '$ruta' },
      { $unwind: '$usuAyudanteId' },
      { $unwind: '$usuAyudanteId' },
    ]);

    // if (!usExiste) {
    //   throw new NotFoundException('no existe el usuario');
    // }

    console.log(data, 'viajessss');
    return data;
  }

  // async infoViajes() {
  //   const data = await this.viajeModel.aggregate([
  //     {
  //       $lookup: {
  //         from: 'buses',
  //         localField: 'bus',
  //         foreignField: '_id',
  //         as: 'bus',
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'rutas',
  //         localField: 'ruta',
  //         foreignField: '_id',
  //         as: 'ruta',
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'usuarios',
  //         localField: 'usuChoferId',
  //         foreignField: '_id',
  //         as: 'usuChoferId',
  //       },
  //     },
  //     {
  //       $lookup: {
  //         from: 'usuarios',
  //         localField: 'usuAyudanteId',
  //         foreignField: '_id',
  //         as: 'usuAyudanteId',
  //       },
  //     },
  //     { $unwind: '$bus' },
  //     { $unwind: '$ruta' },
  //     { $unwind: '$usuAyudanteId' },
  //     { $unwind: '$usuAyudanteId' },
  //   ]);

  //   console.log(data, 'populrar');

  //   return data;
  // }
}
