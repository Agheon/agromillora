import Joi from 'joi';
import moment from 'moment-timezone'
import md5 from 'md5'
import { db } from '../../config/db'
import { ktoK, cleanRut } from '../../tools'


export default [
{ 
    method: 'GET',
    path: '/api/usersEnabled', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'user',
                        status: 'enabled'
                    }
                }).then(result => {
                    if (result.docs[0]) {
                        resolve({ok: result.docs })
                    } else {
                        resolve({ err: 'No existen usuarios'})
                    }
                })
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/user',
    options: {
        handler: (request, h) => {
            let reqData = {}
            reqData.rut = cleanRut(ktoK(request.payload.rut))
            reqData.name = request.payload.name
            reqData.lastname = request.payload.lastname
            reqData.password = request.payload.password
            reqData.role = request.payload.role
            reqData.charge = request.payload.charge
            reqData.phone = request.payload.phone
            reqData.email = request.payload.email

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: reqData.rut,
                        type: 'user'
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        resolve({ err: `Ya existe un usuario de rut ${reqData.rut}` })
                    } else {
                        let newUser = {
                            _id: reqData.rut,
                            type: 'user',
                            status: 'enabled',
                            password: md5(reqData.password),
                            name: reqData.name,
                            role: reqData.role,
                            position: reqData.charge,
                            lastname: reqData.lastname,
                            phone: reqData.phone,
                            email: reqData.email
                        }

                        db.insert(newUser).then(newUserRes=>{
                            if(newUserRes.ok) {
                                resolve({ok: newUser})
                            } else {
                                resolve({err: 'No se ha podido crear eal usuario.'})
                            }
                        })
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                rut: Joi.string().required(),
                name: Joi.string().required(),
                lastname: Joi.string().required(),
                password: Joi.string().required(),
                role: Joi.string().required(),
                charge: Joi.string().required(),
                phone: Joi.string().required(),
                email: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/modUser',
    options: {
        handler: (request, h) => {
            let reqData = {}
            reqData.rut = cleanRut(ktoK(request.payload.rut))
            reqData.name = request.payload.name
            reqData.lastname = request.payload.lastname
            reqData.password = request.payload.password
            reqData.changePassword = request.payload.changePassword
            reqData.role = request.payload.role
            reqData.charge = request.payload.charge
            reqData.phone = request.payload.phone
            reqData.email = request.payload.email

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: reqData.rut
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        let userSelected = result.docs[0]

                        userSelected.name = reqData.name
                        userSelected.lastname = reqData.lastname
                        userSelected.role = reqData.role
                        userSelected.charge = reqData.charge
                        userSelected.phone = reqData.phone
                        userSelected.email = reqData.email

                        if(reqData.changePassword == 'yes') {
                            userSelected.password = md5(reqData.password)
                        }

                        db.insert(userSelected).then(modUserRes=>{
                            if(modUserRes.ok) {
                                resolve({ok: userSelected})
                            } else {
                                resolve({err: 'No se ha podido crear eal usuario.'})
                            }
                        })
                    } else {
                        resolve({err: 'no hemos encontrado el usuario seleccionado, por favor recargue la página'})
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                rut: Joi.string().required(),
                name: Joi.string().required(),
                lastname: Joi.string().required(),
                password: Joi.string().required().allow(''),
                changePassword: Joi.string().required(),
                role: Joi.string().required(),
                charge: Joi.string().required(),
                phone: Joi.string().required(),
                email: Joi.string().required()
            })
        }
    }
},
{
    method: 'DELETE',
    path: '/api/user',
    options: {
        handler: (request, h) => {
            let id = request.payload._id

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: ktoK(cleanRut(id))
                    }
                }).then(result => {
                    if(result.docs[0]) {
                        db.destroy(result.docs[0]._id, result.docs[0]._rev).then(deleteRes=>{
                            console.log(deleteRes)
                            if(deleteRes.ok) {
                                resolve({ok: `USUARIO ELIMINADO CORRECTAMENTE`})
                            }
                        })
                    } else {
                        resolve({err: 'NO HEMOS ENCONTRADO EL USUARIO SELECCIONADO, POR FAVOR RECARGUE LA PÁGINA E INTENTELO NUEVAMENTE'})
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                _id: Joi.string().required()
            })
        }
    }
},
]

