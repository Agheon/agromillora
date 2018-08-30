import Joi from 'joi';
import moment from 'moment-timezone'
import { db } from '../../config/db'
import { ktoK, cleanRut } from '../../tools'

export default [
{ 
    method: 'GET',
    path: '/api/clientsEnabled', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'client',
                        status: 'enabled'
                    }
                }).then(result => {
                    if (result.docs[0]) {

                        resolve({ok: result.docs })
                    } else {
                        resolve({ err: 'No existen clientes' })
                    }
                })
            })
        }
    }
},
{ 
    method: 'GET',
    path: '/api/clientsDisabled', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'client',
                        status: 'disabled'
                    }
                }).then(result => {
                    if (result.docs[0]) {

                        resolve({ok: result.docs })
                    } else {
                        resolve({ err: 'No existen clientes' })
                    }
                })
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/client',
    options: {
        handler: (request, h) => {
            let reqData = {}
            reqData.rut = cleanRut(ktoK(request.payload.rut))
            reqData.name = request.payload.name
            reqData.phone = request.payload.phone
            reqData.email = request.payload.email

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'client',
                        rut: reqData.rut
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        resolve({ err: `Ya existe un cliente de rut ${reqData.rut}` })
                    } else {
                        let newClient = {
                            _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                            type: 'client',
                            status: 'enabled',
                            rut: reqData.rut,
                            name: reqData.name,
                            phone: reqData.phone,
                            email: reqData.email
                        }

                        db.insert(newClient).then(modRes=>{
                            if(modRes.ok) {
                                resolve({ok: newClient})
                            } else {
                                resolve({err: 'No se ha podido crear el cliente.'})
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
                phone: Joi.string().required(),
                email: Joi.string().required()
            })
        }
    }
},
{
    method: 'PUT',
    path: '/api/client',
    options: {
        handler: (request, h) => {
            let reqData = {}
            reqData.originalRut = cleanRut(ktoK(request.payload.originalRut))
            reqData.rut = cleanRut(ktoK(request.payload.rut))
            reqData.name = request.payload.name
            reqData.phone = request.payload.phone
            reqData.email = request.payload.email

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'client',
                        rut: reqData.originalRut
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        let client = result.docs[0]

                        client.rut = reqData.rut
                        client.name = reqData.name
                        client.phone = reqData.phone
                        client.email = reqData.email

                        db.insert(client).then(modRes=>{
                            if(modRes.ok) {
                                resolve({ok: client})
                            } else {
                                resolve({err: 'No se ha podido modificar el cliente.'})
                            }
                        })
                    } else {
                        resolve({ err: `No existe el cliente de rut <b>${reqData.originalRut}</b>` })
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                originalRut: Joi.string().required(),
                rut: Joi.string().required(),
                name: Joi.string().required(),
                phone: Joi.string().required(),
                email: Joi.string().required()
            })
        }
    }
}
]
