import Joi from 'joi'
import moment from 'moment-timezone'
import { db } from '../../config/db'

const Budget = [
{ 
    method: 'GET',
    path: '/iacceptthequote', 
    options: {
        auth: false,
        handler: (request, h) => {
            return new Promise(resolve => {
                let params = request.query

                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'budget',
                        acceptToken: params.token
                    },
                    sort: [{
                        _id: 'desc'
                    }]
                }).then(result => {
                    if (result.docs[0]) {
                        
                        
                        if (result.docs[0].status == 'sended') {
                            result.docs[0].status = 'approved'
                            result.docs[0].approvedDate = moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS')

                            db.insert(result.docs[0]).then(budgetRes=>{
                                console.log(budgetRes)
                                if(budgetRes.ok) {
                                    resolve(h.view('budgetlink', { ok: 'cotización aceptada' }, { layout: false }))
                                } else {
                                    resolve(h.view('budgetlink', { err: 'error al intentar aprobar cotización, contacte con un administrador.' }, { layout: false })) 
                                }
                            })
                        } else if(result.docs[0].status == 'approved') {
                            resolve(h.view('budgetlink', { err: 'Esta cotización ya fue aprobada anteriormente' }, { layout: false }))
                        } else if (result.docs[0].status == 'reserved') {
                            resolve(h.view('budgetlink', { err: 'Esta cotización ya fue reservada anteriormente' }, { layout: false }))
                        } else if (result.docs[0].status == 'created') {
                            resolve(h.view('budgetlink', { err: 'Esta cotización fue creada pero no enviada' }, { layout: false }))
                        } else if (result.docs[0].status == 'draft') {
                            resolve(h.view('budgetlink', { err: 'Esta cotización aún no ha sido creada' }, { layout: false }))
                        } else if(result.docs[0].status == 'expired') {
                            resolve(h.view('budgetlink', { err: 'Esta cotización ya expiró' }, { layout: false }))
                        }

                    } else {
                        resolve(h.view('budgetlink', { err: 'No existe la cotización' }, { layout: false }))
                    }
                })
                
            })
        }
    }
},
{ 
    method: 'GET',
    path: '/api/budgets', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'budget'
                    },
                    sort: [{
                        _id: 'desc'
                    }]
                }).then(result => {
                    if (result.docs[0]) {
                        resolve({ok: result.docs })
                    } else {
                        resolve({ err: 'No existen cotizaciones.' })
                    }
                })
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/getBudgets',
    options: {
        handler: (request, h) => {
            let status = request.payload.status

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'budget',
                        status : status
                    },
                    sort: [{
                        _id: 'desc'
                    }]
                }).then(result => {
                    if (result.docs[0]) {
                        resolve({ok: result.docs })
                    } else {
                        resolve({ err: 'No existen cotizaciones.' })
                    }
                })
            })
        },
        validate: {
            payload: Joi.object().keys({
                status: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/changeBudgetStatus',
    options: {
        handler: (request, h) => {
            let budgetId = request.payload.id
            let toStatus = request.payload.toStatus

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: budgetId
                    }
                }).then(result => {
                    if (result.docs[0]) {
                        result.docs[0].status = toStatus

                        db.insert(result.docs[0]).then(budgetRes=>{
                            console.log(budgetRes)
                            if(budgetRes.ok) {
                                resolve({ ok: result.docs[0] })
                            } else {
                                resolve({ err: 'Ocurrio un error, por favor recargue la página' }) 
                            }
                        })

                        //resolve({ ok: result.docs[0] })
                    } else {
                        resolve({ err: 'No existe la cotización' })
                    }
                })
            })
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string().required(),
                toStatus: Joi.string().required()
            })
        }
    }
},
{
    method: 'DELETE',
    path: '/api/deleteDraftBudget',
    options: {
        handler: (request, h) => {
            let draftBudgetId = request.payload.id

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: draftBudgetId
                    }
                }).then(result => {
                    if (result.docs[0]) {

                        db.destroy(result.docs[0]._id, result.docs[0]._rev).then(destroyRes=>{
                            if(destroyRes.ok) {
                                resolve({ok: result.docs[0]})
                            } else {
                                resolve({err: 'No hemos podido eliminar el borrador'})
                            }
                        })
                        
                    } else {
                        resolve({ err: 'No existe el borrador' })
                    }
                })
            })
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/getBudget',
    options: {
        handler: (request, h) => {
            let budgetId = request.payload.budgetId

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: budgetId
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        resolve({ ok: result.docs[0] })
                    } else {
                        resolve({ err: 'No existe la cotización' })
                    }
                })
            })
        },
        validate: {
            payload: Joi.object().keys({
                budgetId: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/newBudget',
    options: {
        handler: (request, h) => {
            let reqData = {}
            
            reqData.reference = request.payload.reference

            reqData.clientRut = request.payload.clientRut
            reqData.clientName = request.payload.clientName
            reqData.clientPhone = request.payload.clientPhone
            reqData.clientEmail = request.payload.clientEmail

            reqData.userFirmName = request.payload.userFirmName
            reqData.userFirmLastname = request.payload.userFirmLastname
            reqData.userFirmPosition = request.payload.userFirmPosition
            reqData.userFirmPhone = request.payload.userFirmPhone
            reqData.userFirmEmail = request.payload.userFirmEmail

            reqData.products = JSON.parse(request.payload.products)
            reqData.layout = JSON.parse(request.payload.layout)
            reqData.creationDate = request.payload.creationDate
            reqData.expirationDate = request.payload.expirationDate
            reqData.advancePercent = request.payload.advancePercent
            reqData.iva = request.payload.iva
            reqData.subtotal = request.payload.subtotal
            
            parseExpirationDate(reqData.expirationDate)
            return new Promise(resolve => {
                
                getBudgetCounter().then(resCounter=>{
                    if(resCounter.ok) {
                        resCounter.ok.count = resCounter.ok.count+1
                        let budgetObj = {
                            _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                            type: 'budget',
                            status: 'created',
                            reference: reqData.reference,
                            number: resCounter.ok.count,
                            creationDate: reqData.creationDate,
                            expirationDate: parseExpirationDate(reqData.expirationDate),
                            products: reqData.products,
                            amounts: {
                                advancePercent: reqData.advancePercent,
                                iva: reqData.iva,
                                subtotal: reqData.subtotal
                            },
                            client: {
                                rut: reqData.clientRut,
                                name: reqData.clientName,
                                phone: reqData.clientPhone,
                                email: reqData.clientEmail
                            },
                            user: {
                                name: reqData.userFirmName,
                                lastname: reqData.userFirmLastname,
                                position: reqData.userFirmPosition,
                                phone: reqData.userFirmPhone,
                                email: reqData.userFirmEmail
                            },
                            layout: reqData.layout
                        }
                        
                        db.insert(budgetObj).then(budgetRes=>{
                            console.log(budgetRes)
                            if(budgetRes.ok) {
                                budgetObj._rev = budgetRes.rev
                                setBudgetCounter(resCounter.ok).then(setCounterRes=>{
                                    resolve({ok: budgetObj})
                                })
                            } else {
                                resolve({err: 'No se ha podido crear la cotización'})
                            }
                        })
                    } else {
                        resolve({err: resCounter.err})
                    }
                    
                })
                
                
            })    
            
        },
        validate: {
            payload: Joi.object().keys({
                reference: Joi.string().required(),
                clientRut: Joi.string().allow(''),
                clientName: Joi.string().allow(''),
                clientPhone: Joi.string().allow(''),
                clientEmail: Joi.string().allow(''),
                userFirmName: Joi.string().allow(''),
                userFirmLastname: Joi.string().allow(''),
                userFirmPosition: Joi.string().allow(''),
                userFirmPhone: Joi.string().allow(''),
                userFirmEmail: Joi.string().allow(''),
                products: Joi.string().allow(''),
                layout: Joi.string().allow(''),
                creationDate: Joi.string().allow(''),
                expirationDate: Joi.string().allow(''),
                advancePercent: Joi.string().required(),
                iva: Joi.string().required(),
                subtotal: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/draftBudget',
    options: {
        handler: (request, h) => {
            let reqData = {}
            if(request.payload.id != '') {
                reqData.id = request.payload.id
            }
            reqData.reference = request.payload.reference

            reqData.clientRut = request.payload.clientRut
            reqData.clientName = request.payload.clientName
            reqData.clientPhone = request.payload.clientPhone
            reqData.clientEmail = request.payload.clientEmail

            reqData.userFirmName = request.payload.userFirmName
            reqData.userFirmLastname = request.payload.userFirmLastname
            reqData.userFirmPosition = request.payload.userFirmPosition
            reqData.userFirmPhone = request.payload.userFirmPhone
            reqData.userFirmEmail = request.payload.userFirmEmail

            /*
            if(request.payload.products !== null && request.payload.products !== '') {  
                reqData.products = JSON.parse(request.payload.products)
            } else {
                reqData.products = ''
            }
            */
            reqData.products = JSON.parse(request.payload.products)
            reqData.layout = JSON.parse(request.payload.layout)
            reqData.creationDate = request.payload.creationDate
            reqData.expirationDate = parseExpirationDate(request.payload.expirationDate)
            reqData.advancePercent = request.payload.advancePercent
            reqData.iva = request.payload.iva
            reqData.subtotal = request.payload.subtotal
            
            return new Promise(resolve => {
                if(reqData.id) {
                    db.find({
                        selector: {
                            _id: reqData.id
                        }
                    }).then(result => { 
                        if (result.docs[0]) { // si ya existe el borrador
                            let originalDraft = result.docs[0]

                            originalDraft.reference = reqData.reference
                            originalDraft.expirationDate = reqData.expirationDate
                            originalDraft.products = reqData.products
                            originalDraft.amounts = {
                                advancePercent: reqData.advancePercent,
                                iva: reqData.iva,
                                subtotal: reqData.subtotal
                            }
                            originalDraft.client = {
                                rut: reqData.clientRut,
                                name: reqData.clientName,
                                phone: reqData.clientPhone,
                                email: reqData.clientEmail
                            }
                            originalDraft.layout = reqData.layout

                            db.insert(originalDraft).then(draftRes=>{
                                if(draftRes.ok) {
                                    resolve({ok: originalDraft})
                                } else {
                                    resolve({err: 'No se ha podido crear el borrador'})
                                }
                            })
                        } else {
                            resolve({ err: 'No se ha podido modificar el borrador de cotización.' })
                        }
                    })
                } else { // si no existe el borrador
                    getBudgetCounter().then(resCounter=>{
                        if(resCounter.ok) {
                            resCounter.ok.draftCount = resCounter.ok.draftCount+1
                            let budgetObj = {
                                _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                                type: 'budget',
                                status: 'draft',
                                reference: reqData.reference,
                                number: resCounter.ok.draftCount,
                                creationDate: reqData.creationDate,
                                expirationDate: reqData.expirationDate,
                                products: reqData.products,
                                amounts: {
                                    advancePercent: reqData.advancePercent,
                                    iva: reqData.iva,
                                    subtotal: reqData.subtotal
                                },
                                client: {
                                    rut: reqData.clientRut,
                                    name: reqData.clientName,
                                    phone: reqData.clientPhone,
                                    email: reqData.clientEmail
                                },
                                user: {
                                    name: reqData.userFirmName,
                                    lastname: reqData.userFirmLastname,
                                    position: reqData.userFirmPosition,
                                    phone: reqData.userFirmPhone,
                                    email: reqData.userFirmEmail
                                },
                                layout: reqData.layout
                            }
                            
                            db.insert(budgetObj).then(draftRes=>{
                                if(draftRes.ok) {
                                    setBudgetCounter(resCounter.ok).then(setCounterRes=>{
                                        resolve({ok: budgetObj})
                                    })
                                } else {
                                    resolve({err: 'No se ha podido crear el borrador'})
                                }
                            })
                        } else {
                            resolve({err: resCounter.err})
                        }
                    })
                }    
            })    
            
        },
        validate: {
            payload: Joi.object().keys({
                id: Joi.string().allow(''),
                reference: Joi.string().required(),
                clientRut: Joi.string().allow(''),
                clientName: Joi.string().allow(''),
                clientPhone: Joi.string().allow(''),
                clientEmail: Joi.string().allow(''),
                userFirmName: Joi.string().allow(''),
                userFirmLastname: Joi.string().allow(''),
                userFirmPosition: Joi.string().allow(''),
                userFirmPhone: Joi.string().allow(''),
                userFirmEmail: Joi.string().allow(''),
                products: Joi.string().allow(''),
                layout: Joi.string().allow(''),
                creationDate: Joi.string().allow(''),
                expirationDate: Joi.string().allow(''),
                advancePercent: Joi.string().required(),
                iva: Joi.string().required(),
                subtotal: Joi.string().required()
            })
        }
    }
}
]

function getBudgetCounter() {
    return new Promise(resolve=> {
        db.find({
            selector: {
                _id: 'budgetCounter'
            }
        }).then(result => {
            if (result.docs[0]) {
    
                resolve({ok: result.docs[0] })
            } else {
                resolve({ err: 'No se ha podido crear la cotización.' })
            }
        })
    })
}

function setBudgetCounter(budgetCounter) {
    return new Promise(resolve=>{
        db.insert(budgetCounter).then(res=>{
            if(res.ok) {
                resolve({ok: budgetCounter})
            } else {
                resolve({err: 'No se ha podido modificar el contador'})
            }
        })
    })
}

function parseExpirationDate(date) {
    let format1 = date.split('/')
    let formatDate = `${format1[2]}-${format1[1]}-${format1[0]}`
    return formatDate
}

export default Budget
