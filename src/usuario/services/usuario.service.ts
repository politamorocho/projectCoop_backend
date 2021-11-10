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
//import * as moment from 'moment-timezone';
import { Usuario } from '../entities/usuario.entity';

//todas estan en la clase usuario.dto
import {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  FiltroUsuarioDto,
  IdUsuarioDto,
  CambiarClaveDto,
  RecuperarClaveDto,
  FijarNuevaClaveDto,
} from '../dtos/usuario.dto';
import { RolService } from './rol.service';
import * as moment from 'moment';
import { EmailService } from 'src/email/services/email.service';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,

    private readonly rolService: RolService,
    private emailService: EmailService,
  ) {}

  //mostrar todos los usuarios en bd
  async mostrarTodo() {
    let data = await this.usuarioModel.find().exec();
    return data;
  }

  //muestra la info de un usuario activo enviado por el query
  async mostrarUno(idUs: IdUsuarioDto) {
    const { id } = idUs;
    const data = await this.usuarioModel
      .findOne({ _id: id })

      .exec();
    if (!data) {
      return false;
    }
    if (!data.estado) {
      return false;
    }

    return data;
  }

  //filtra usuarios por activos=1 o inactivos=0 enviado por query
  async filtroActivoInactivo(query: FiltroUsuarioDto) {
    let data;
    const { estado } = query;
    if (estado == 0) {
      data = await this.usuarioModel.find({ estado: false }).exec();
      return data;
    }
    if (estado == 1) {
      data = await this.usuarioModel.find({ estado: true }).exec();
      return data;
    }
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

      return data;
    }

    if (cedula) {
      let dato = await this.usuarioModel.find({ cedula: cedula });

      return dato;
    }
  }

  //busca solo por nombre pero no se esta usando
  async busquedaPorNombre(query: FiltroUsuarioDto) {
    const { busqueda } = query;

    let data = await this.usuarioModel.find({
      $or: [
        { nombre: { $regex: `^${busqueda}`, $options: '$i' } },
        { apellido: { $regex: `^${busqueda}`, $options: '$i' } },
      ],
    });

    if (!data) {
      throw new NotFoundException(`No existen coincidencias`);
    }

    console.log(data);
    return data;
  }

  //crea usuarios
  async crearUsuario(usuario: CrearUsuarioDto) {
    //si es un usuario con correo lo verifica si no, no
    if (usuario.correo) {
      const correoExiste = await this.usuarioModel.findOne({
        correo: usuario.correo,
      });

      //si el correo existe, no se puede  crear el usuario
      if (correoExiste) {
        throw new BadRequestException(
          `El correo ${correoExiste.correo} ya existe`,
        );
      }
    }
    const cedulaExiste = await this.usuarioModel.findOne({
      cedula: usuario.cedula,
    });
    if (cedulaExiste) {
      throw new BadRequestException(
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
    if (usuario.claveUsuario) {
      const salt = bcryptjs.genSaltSync(10);
      usuario.claveUsuario = bcryptjs.hashSync(usuario.claveUsuario, salt);
    }
    //guardar en bd
    const data = await new this.usuarioModel(usuario).save();

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

    // verifica si existe el correo, si es el mismo no hace nada
    //si es nuevo, verifica que no exista
    if (cambios.correo) {
      if (cambios.correo != data.correo) {
        const correoExiste = await this.usuarioModel.findOne({
          correo: cambios.correo,
        });

        if (correoExiste) {
          throw new BadRequestException(
            `el correo ${correoExiste.correo} ya existe`,
          );
        }
      }
    }

    //verificar si es la misma anterior no hace nada, si es diferente verifca
    if (cambios.cedula) {
      if (cambios.cedula !== data.cedula) {
        const cedulaExiste = await this.usuarioModel.findOne({
          cedula: cambios.cedula,
        });
        if (cedulaExiste) {
          return new BadRequestException(
            `La cedula ${cedulaExiste.cedula} ya existe`,
          );
        }
        console.log('Aqui debe llegar la ceudla');
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

    const actualizado = await this.usuarioModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    console.log('actualizaado', actualizado);

    return actualizado;
  }

  //para actualizar la clave
  async verificarClave(idUs: IdUsuarioDto, cambios: CambiarClaveDto) {
    const { id } = idUs;
    const { claveAnterior, claveNueva } = cambios;

    const usuario1 = await this.usuarioModel.findById({ _id: id });
    if (!usuario1) {
      throw new NotFoundException('No existe el usuario');
    }

    const siCoincide = await bcryptjs.compare(
      claveAnterior,
      usuario1.claveUsuario,
    );

    if (!siCoincide) {
      throw new BadRequestException('Los datos introducidos no coinciden');
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

  //eliminar un usuario
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

  //recuperar claveUsuario por codigo enviado al correo
  async enviarCorreoRecuperarClave(correoUs: RecuperarClaveDto) {
    const { correo } = correoUs;
    const siCorreo = await this.usuarioModel.findOne({ correo: correo });

    if (!siCorreo) {
      throw new NotFoundException('No existe el correo en db');
    }
    const nombre = siCorreo.nombre;
    const corr = siCorreo.correo;
    const codigo = await this.agregarCodigoRecuperacion(siCorreo._id);

    this.emailService.enviarRecuperacionClave(nombre, corr, codigo);
    return true;
  }

  //metodo para generar el codigo a enviar
  generarCodigo() {
    return (
      Math.random().toString(36).substring(2, 5) +
      Math.random().toString(36).substring(2, 5)
    );
  }

  //fijar el codigo y tiempo generado al usuario correspondiente
  async agregarCodigoRecuperacion(id: string) {
    const codigo = this.generarCodigo();
    const actualizado = await this.usuarioModel.findByIdAndUpdate(
      id,
      {
        $set: {
          codigoRecuperacion: codigo,
          codigoRecuperacionExpira: moment().add(15, 'minutes'),
        },
      },
      { new: true },
    );
    return codigo;
  }

  //verifica el tiempo de caducidad del codigo enviado por correo
  async verificarCaducidadCodigo(codigo: string) {
    const usuario = await this.usuarioModel.findOne({
      codigoRecuperacion: codigo,
    });

    if (!usuario) {
      return false;
    }

    const hoy = moment().format('YYYY-MM-DD HH:mm:ss');
    if (
      hoy <
      moment(usuario.codigoRecuperacionExpira).format('YYYY-MM-DD HH:mm:ss')
    ) {
      return true;
    } else {
      return false;
    }
  }

  //fija la nueva clave del usuario verificando el tiempo de caducidad
  async asignarNuevaClave(info: FijarNuevaClaveDto) {
    const { claveNueva, codigo } = info;
    const codigoExiste = await this.usuarioModel.findOne({
      codigoRecuperacion: codigo,
    });
    if (!codigoExiste) {
      throw new NotFoundException('No coincide el codigo');
    }

    const aTiempo = await this.verificarCaducidadCodigo(codigo);
    if (!aTiempo) {
      throw new BadRequestException('El codigo ha caducado');
    }

    const salt = await bcryptjs.genSaltSync(10);
    const nueva = await bcryptjs.hashSync(claveNueva, salt);

    const actualizado = await this.usuarioModel.findByIdAndUpdate(
      codigoExiste._id,
      { $set: { claveUsuario: nueva } },
      { new: true },
    );

    return true;
  }

  //existe un usurio retorna un usuario
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

    return data;
  }

  async estadoActivoPorId(id: string) {
    const exist = await this.usuarioModel.findById({ _id: id });
    if (!exist.estado) {
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
    const data = await this.usuarioModel.findOne({ cedula: cedulaUs }).exec();

    if (!data) {
      return false;
    }

    return data;
  }

  //busca a un usuario con rol secretaria para obtener su email
  async esSecretaria() {
    const esSecretaria = await this.rolService.esRolSecretaria();
    if (!esSecretaria) {
      return false;
    }

    const sec = await this.usuarioModel.findOne({ rol: esSecretaria._id });
    if (!sec) {
      return false;
    }

    // const correo= sec.correo;
    return sec;
  }

  //busca a un usuario con rol administrador para obtener su email
  async esAdministrador() {
    const esAdministrador = await this.rolService.esRolAdministrador();
    if (!esAdministrador) {
      return false;
    }
    const adm = await this.usuarioModel.findOne({ rol: esAdministrador._id });
    if (!adm) {
      return false;
    }
    return adm;
  }
}
