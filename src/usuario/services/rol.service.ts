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
  constructor(@InjectModel(Rol.name) private rolModel: Model<Rol>) {}

  //crea un rol nuevo
  async crearRol(rol: CrearRolDto) {
    const rolExiste = await this.rolModel.find({
      nombre: rol.nombre,
    });
    console.log(rolExiste, 'rol que existe');

    ////falta revisar el control de nombres repetidos///
    //si existe no se crea
    // if (rolExiste) {
    //   throw new BadRequestException(`El rol ${rol.nombre} ya existe`);
    // }

    //si no existe lo crea
    const data = await new this.rolModel(rol).save();

    return data;
  }

  //mostrar todos los roles
  async todos() {
    return await this.rolModel.find().exec();
  }

  //filtra roles por activos=1 o inactivos=0 enviado por query
  async filtroActivoInactivo(query: FiltroRolDto) {
    let data;

    const { estado } = query;

    if (estado == 0) {
      data = await this.rolModel.find({ estado: false }).exec();
      return data;
    }
    if (estado == 1) {
      data = await this.rolModel.find({ estado: true }).exec();
      return data;
    }
  }

  //info de un rol buscado por id enviado por query
  async mostrarUno(query: IdRolDto) {
    const { id } = query;
    const data = await this.rolModel.findOne({ _id: id }).exec();
    if (!data) {
      throw new NotFoundException(`No existe rol con id: ${id}`);
    }
    return data;
  }

  //buscar roles por nombre
  async buscar(query: FiltroRolDto) {
    const { busqueda } = query;
    const data = await this.rolModel.find({
      nombre: { $regex: `${busqueda}`, $options: '$i' },
    });

    if (!data) {
      throw new NotFoundException('No existen roles que coincidan');
    }
    return data;
  }

  //actualiza un rol seleccinado por id, enviado por query
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
        `no se puede actualizar el rol porque es inactivo`,
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
        `no se puede eliminar el rol  porque es inactivo`,
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

  async esRolEmpleado(idRol: string) {
    const data = await this.rolModel.findById({ _id: idRol });
    const nombre = data.nombre;
    const emp: string = 'empleado';
    if (nombre.toLowerCase() !== emp.toLowerCase()) {
      throw new BadRequestException('el usuario no tiene el rol de empleado');
    }

    return true;
  }
}
