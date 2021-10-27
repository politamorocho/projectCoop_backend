import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Model, FilterQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Db } from 'mongodb';
import { Viaje } from '../entities/viaje.entity';
import { CrearViajeDto, FiltroViajeDto } from '../dtos/viaje.dto';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { BusService } from './bus.service';
import { RutaService } from './ruta.service';
import { FiltroUsuarioDto } from 'src/usuario/dtos/usuario.dto';

@Injectable()
export class ViajeService {
  constructor(
    @Inject('MONGO') private existeIdbaseMongo: Db,
    @InjectModel(Viaje.name) private viajeModel: Model<Viaje>,
    private usuarioService: UsuarioService,
    private busService: BusService,
    private rutaService: RutaService,
  ) {}

  //crear un viaje
  async crearViaje(viaje: CrearViajeDto) {
    if (!this.usuarioService.existeUsuarioId(viaje.usuario_chofer_id)) {
      throw new BadRequestException('no existe usuario con ese id');
    }

    if (!this.usuarioService.existeUsuarioId(viaje.usuario_ayudante_id)) {
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
    return this.viajeModel.find().exec();
  }

  async viajePorUsuario(nombre: FiltroUsuarioDto) {
    const usExiste = await this.usuarioService.busquedaPorNombre(nombre);

    // const viajeExiste = await this.viajeModel
    //   .find({
    //     $or: [
    //       { usuario_chofer_id: usExiste._id },
    //       { usuario_ayudante_id: usExiste._id },
    //     ],
    //   })
    //   .populate('usuario')
    //   .populate('bus')
    //   .populate('ruta');

    // if (!usExiste) {
    //   throw new NotFoundException('no existe el usuario');
    // }

    // return viajeExiste;
  }
}
