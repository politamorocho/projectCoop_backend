import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Db } from 'mongodb';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcryptjs from 'bcrypt';
const mongoose = require('mongoose');
import { isMongoId } from 'class-validator';
import { Usuario } from '../entities/usuario.entity';

import {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  FiltroUsuarioDto,
  IdUsuarioDto,
  CambiarClaveDto,
} from '../dtos/usuario.dto';
import { RolService } from './rol.service';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,

    private readonly rolService: RolService,
  ) {}

  async mostrarTodo() {
    console.log(this.usuarioModel.schema.paths);
    let data = await this.usuarioModel.find();
    //.populate('rol', '__v').exec();

    return data;
  }

  //muestra la info de un usuario enviado por el query
  async mostrarUno(idUs: IdUsuarioDto) {
    const { id } = idUs;
    const data = await this.usuarioModel
      .findOne({ _id: id })
      //.populate('rol', '__v')
      .exec();
    if (!data) {
      return false;
    }
    if (!data.estado) {
      return false;
    }

    return data;
  }

  //filtra activos e inactivos
  async filtroActivoInactivo(query: FiltroUsuarioDto) {
    let data;
    const { estado } = query;
    if (estado == 0) {
      data = await this.usuarioModel
        .find({ estado: false })
        // .populate('rol', '-__v')
        .exec();
      return data;
    }
    if (estado == 1) {
      data = await this.usuarioModel
        .find({ estado: true })
        // .populate('rol', '-__v')
        .exec();
      return data;
    }

    //  return data;
  }

  //busca usuarios por coincidencias de nombres o apellidos o cedula
  async busqueda(query: FiltroUsuarioDto) {
    const { busqueda, cedula } = query;
    if (busqueda) {
      let data = await this.usuarioModel.find({
        $or: [
          { nombre: { $regex: `^${busqueda}`, $options: '$i' } },
          { apellido: { $regex: `^${busqueda}`, $options: '$i' } },
        ],
      });
      //  .populate('rol', '-__v');
      return data;
    }

    if (cedula) {
      let dato = await this.usuarioModel
        .find({ cedula: cedula })
        .populate('rol', '-__v');
      return dato;
    }
  }

  async busquedaPorNombre(query: FiltroUsuarioDto) {
    const { busqueda } = query;

    let data = await this.usuarioModel.find({
      $or: [
        { nombre: { $regex: `^${busqueda}`, $options: '$i' } },
        { apellido: { $regex: `^${busqueda}`, $options: '$i' } },
      ],
    });
    // .populate('rol', '-__v');

    if (!data) {
      throw new NotFoundException(`No existen coincidencias`);
    }

    // return data2;
    console.log(data);
    return data;
  }

  async crearUsuario(usuario: CrearUsuarioDto) {
    const correoExiste = await this.usuarioModel.findOne({
      correo: usuario.correo,
    });

    //si el correo existe, no se puede  crear el usuario
    if (correoExiste) {
      return new BadRequestException(
        `El correo ${correoExiste.correo} ya existe`,
      );
    }

    const cedulaExiste = await this.usuarioModel.findOne({
      cedula: usuario.cedula,
    });
    if (cedulaExiste) {
      return new BadRequestException(
        `La cedula ${cedulaExiste.cedula} ya existe`,
      );
    }

    //si es un mongoid valido, verifica que exista
    const rolId = await this.rolService.verificaRolId(usuario.rol);
    if (!rolId) {
      throw new BadRequestException(`El rol  ${usuario.rol} no existe`);
    }

    //pregunta si es un rol activo
    const rolActivo = await this.rolService.verificaRolActivo(usuario.rol);
    if (!rolActivo) {
      throw new BadRequestException(`El rol asignado no es un rol activo`);
    }

    //si no existe el correo y existe el rol, entonces crea el usuario
    // if (!correoExiste) {
    //encriptar la clave
    const salt = bcryptjs.genSaltSync(10);
    usuario.claveUsuario = bcryptjs.hashSync(usuario.claveUsuario, salt);

    //guardar en bd
    const data = await new this.usuarioModel(usuario).save();

    console.log(data, 'data');
    return data;
  }

  async actualizar(idUs: IdUsuarioDto, cambios: ActualizarUsuarioDto) {
    const { id } = idUs;
    const existeId = await this.usuarioModel.findOne({ _id: id });

    const usuarioEntity = new this.usuarioModel(cambios);
    const data = usuarioEntity.toObject();
    delete data._id;

    //pregunta si existe el id que llega, si no existe sale.
    if (!existeId) {
      throw new NotFoundException(`El usuario con id: ${id} no existe`);
    }

    //pregunta el estado del usuario que llega, si es false sale.
    if (!existeId.estado) {
      throw new BadRequestException(`no es un usuario activo`);
    }

    //verifica si existe el correo, si existe no puede actualizar
    if (cambios.correo) {
      const correoExiste = await this.usuarioModel.findOne({
        correo: cambios.correo,
      });

      if (correoExiste) {
        throw new BadRequestException(
          `el correo ${correoExiste.correo} ya existe`,
        );
      }
    }

    if (cambios.cedula) {
      const cedulaExiste = await this.usuarioModel.findOne({
        cedula: cambios.cedula,
      });
      if (cedulaExiste) {
        return new BadRequestException(
          `La cedula ${cedulaExiste.cedula} ya existe`,
        );
      }
    }

    //verifica el id de rol que sea valido
    if (cambios.rol) {
      if (!isMongoId(cambios.rol)) {
        throw new BadRequestException(`el rol no es un id de mongo valido`);
      }

      //si es un mongoid valido, verifica que exista
      const rolId = await this.rolService.verificaRolId(cambios.rol);
      if (!rolId) {
        throw new NotFoundException(`el rol no existe`);
      }

      //pregunta si es un rol activo
      const rolActivo = await this.rolService.verificaRolActivo(cambios.rol);
      if (!rolActivo) {
        throw new BadRequestException(`el rol no es un rol activo`);
      }

      data.rol = mongoose.Types.ObjectId(cambios.rol);
    }

    console.log('data:', data);

    const actualizado = await this.usuarioModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    console.log('actualizaado', actualizado);

    return actualizado;
  }

  async verificarClave(idUs: IdUsuarioDto, cambios: CambiarClaveDto) {
    const { id } = idUs;
    const { claveAnterior, claveNueva } = cambios;

    const usuario1 = await this.usuarioModel.findById({ _id: id });
    if (!usuario1) {
      return false;
    }

    //const anterior = cambios.claveAnterior;
    console.log(claveAnterior, 'es la clave anterior');
    const siCoincide = await bcryptjs.compare(
      claveAnterior,
      usuario1.claveUsuario,
    );

    console.log(siCoincide, 'resultado comparacion');
    if (!siCoincide) {
      return false;
    }

    const salt = await bcryptjs.genSaltSync(10);
    const nueva = await bcryptjs.hashSync(claveNueva, salt);

    const actualizado = await this.usuarioModel.findByIdAndUpdate(
      id,
      { $set: { claveUsuario: nueva } },
      { new: true },
    );
    return true;
  }

  async eliminar(idUs: IdUsuarioDto) {
    const { id } = idUs;
    const existeId = await this.usuarioModel.findOne({ _id: id });

    if (!existeId) {
      throw new NotFoundException(`el usuario no existe`);
    }
    if (!existeId.estado) {
      throw new BadRequestException(`El usuario no esta activo`);
    }

    const data = await this.usuarioModel.findByIdAndUpdate(
      id,
      { estado: false },
      { new: true },
    );

    return data;
  }

  async existeUsuarioIdRetUs(id: string) {
    const data = await this.usuarioModel.findById({ _id: id });
    //.populate('rol', '-__v');

    // if (!data) {
    //   return false;
    // }

    return data;
  }

  async existeUsuarioId(id: string) {
    const data = await this.usuarioModel.findById({ _id: id });

    if (!data) {
      return false;
    }

    return true;
  }

  async existeIdPorDto(idUs: IdUsuarioDto) {
    const { id } = idUs;
    const data = await this.usuarioModel.findById({ _id: id });

    if (!data) {
      return false;
    }

    return true;
  }

  async existeUsuarioPorCorreo(correo: string) {
    const data = await this.usuarioModel.findOne({ correo: correo }).exec();

    if (!data) {
      return false;
    }

    return data;
  }

  async existeUsuarioPorCedula(cedulaUs: string) {
    console.log(cedulaUs, 'cedla usservi');
    const data = await this.usuarioModel.findOne({ cedula: cedulaUs }).exec();

    if (!data) {
      return false;
    }

    return data;
  }

  async busquedaUsuarioViaje(idUs: IdUsuarioDto) {
    const { id } = idUs;
    const data = await this.usuarioModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      {
        $project: {
          nombre: 1,
          apellido: 1,
          cedula: 1,
          tipo: 1,
          rol: '$rol.nombre',
        },
      },
      {
        $lookup: {
          from: 'viajes',
          localField: '_id',
          foreignField: 'usuario_chofer_id',
          as: 'viaje',
        },
      },

      { $unwind: '$viaje' },
    ]);

    console.log(data, 'lo que sale del viaje');

    const datos = data.forEach((x) => {
      //x.viaje.bus.populate('bus');
    });

    return data;
  }
}
