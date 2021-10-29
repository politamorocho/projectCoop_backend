import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Db } from 'mongodb';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Rol } from '../entities/rol.entity';
import {
  ActualizarRolDto,
  CrearRolDto,
  FiltroRolDto,
  IdRolDto,
} from '../dtos/rol.dto';

@Injectable()
export class RolService {
  constructor(
    @Inject('MONGO') private databaseMongo: Db,
    @InjectModel(Rol.name) private rolModel: Model<Rol>,
  ) {}

  async crearRol(rol: CrearRolDto) {
    console.log(rol, 'rol');
    const rolExiste = await this.rolModel.findOne({ nombre: rol.nombre });

    //si existe no se crea
    if (rolExiste) {
      throw new BadRequestException(`El rol ${rolExiste.nombre} ya existe`);
    }

    //si no existe lo crea
    // const datos = {
    //   nombre: rol.nombre,
    //   descripcion: rol.descripcion,
    //   estado: rol.estado,
    // };
    const data = await new this.rolModel(rol).save();
    console.log('data...', data);
    return data;
  }

  //obtener roles activos, inactivos y todos.
  async mostrarTodo(query?: FiltroRolDto) {
    let data = await this.rolModel.find().exec();
    if (query) {
      const { estado } = query;

      if (estado === 0) {
        data = await this.rolModel.find({ estado: false }).exec();
      }
      if (estado === 1) {
        data = await this.rolModel.find({ estado: true }).exec();
      }
      return data;
    }
    return data;
  }

  async mostrarUno(query: IdRolDto) {
    const { id } = query;
    const data = await this.rolModel.findOne({ _id: id }).exec();
    if (!data) {
      throw new NotFoundException(`No existe rol con id: ${id}`);
    }
    return data;
  }

  async actualizar(query: IdRolDto, rol: ActualizarRolDto) {
    const { id } = query;
    const existeId = await this.rolModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(
        `No se puede actualizar porque no existe rol con id: ${id}`,
      );
    }

    if (!existeId.estado) {
      throw new BadRequestException(
        `no se puede actualizar el rol  ${existeId.nombre} porque es inactivo`,
      );
    }

    const data = await this.rolModel.findByIdAndUpdate(
      id,
      { $set: rol },
      { new: true },
    );
    return data;
  }

  async eliminar(query: IdRolDto) {
    const { id } = query;
    const existeId = await this.rolModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(
        `No se puede eliminar porque no existe rol con id: ${id}`,
      );
    }

    if (!existeId.estado) {
      throw new BadRequestException(
        `no se puede actualizar el rol  ${existeId.nombre} porque es inactivo`,
      );
    }
    const data = await this.rolModel.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );
    return data;
  }

  //verifica que existe un rol con ese id
  async verificaRolId(id: string) {
    const rolExiste = await this.rolModel.findById({ _id: id });

    if (!rolExiste) {
      return false;
    }
    return true;
  }

  //verifica que existe un rol activo con ese id
  async verificaRolActivo(id: string) {
    const rolExiste = await this.rolModel.findById({ _id: id });

    if (rolExiste.estado == false) {
      return false;
    }

    return true; //|| rolExiste;
  }
}
