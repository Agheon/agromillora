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
    path: '/api/importedClients', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: 'clients'
                    }
                }).then(result => {
                    if (result.docs[0]) {
                        resolve({ok: result.docs[0] })
                    } else {
                        resolve({ err: 'No existen clientes importados' })
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
    method: 'DELETE',
    path: '/api/client',
    options: {
        handler: (request, h) => {
            let id = request.payload._id

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: id
                    }
                }).then(result => {
                    if(result.docs[0]) {
                        db.destroy(result.docs[0]._id, result.docs[0]._rev).then(deleteRes=>{
                            console.log(deleteRes)
                            if(deleteRes.ok) {
                                resolve({ok: `CLIENTE ELIMINADO CORRECTAMENTE`})
                            }
                        })
                    } else {
                        resolve({err: 'NO HEMOS ENCONTRADO EL CLIENTE SELECCIONADO, POR FAVOR RECARGUE LA PÁGINA E INTENTELO NUEVAMENTE'})
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
{
    method: 'POST',
    path: '/api/importClients',
    options: {
        handler: (request, h) => {
            let clients = JSON.parse(request.payload.clients)
            let clientsRut = clients.reduce((arr, el, i)=>{
                return arr.concat(el.rut)
            }, [])

            return new Promise(resolve => {
                db.find({
                    'selector': {
                        _id: {
                            $gt: 0
                        },
                        type: 'client',
                        rut: {
                            $in: clientsRut
                        }
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        compare({originals: result.docs, news: clients}).then(resBulk=>{
                            db.bulk({docs:resBulk}, function(err) {
                                if (err) throw err;
                                resolve({ok: resBulk})
                            });
                        })  
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                clients: Joi.string().required()
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


async function compare({originals, news}) {
    let toBulk = []
    let originalsRut = originals.reduce((arr, el, i)=>{
        return arr.concat(el.rut)
    }, [])

    await news.forEach(async (el) => {
        let equalsClients = await searchEquals({newEl: el, originals: originals})
        let difClients = await searchDif({newEl: el, originalsRut: originalsRut})

        if(equalsClients) toBulk.push(equalsClients) 
        if(difClients) toBulk.push(difClients)  
    })
    
    return toBulk
}

function searchEquals({newEl, originals}) {
    return new Promise(resolve=>{
        let intercept = originals.filter(el=> {
            return el.rut == newEl.rut
        })

        if(intercept[0]) {
            intercept[0].name = newEl.name
            intercept[0].phone = newEl.phone
            intercept[0].email = newEl.email
            resolve(intercept[0])
        } else {
            resolve(null)
        }
    })
}

function searchDif({newEl, originalsRut}) {
    return new Promise(resolve=>{
        if (originalsRut.indexOf(newEl.rut) == -1) {
            resolve({
                _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                type: 'client',
                status: 'enabled',
                rut: newEl.rut,
                name: newEl.name,
                phone: newEl.phone,
                email: newEl.email
            })
        } else {
            resolve(null)
        }
    })
}