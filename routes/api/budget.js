import Joi from 'joi';
import moment from 'moment-timezone'
import { db } from '../../config/db'

const Budget = [
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
            reqData.expirationDate = request.payload.expirationDate
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
                        if (result.docs[0]) {
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
                } else {
                    let budgetObj = {
                        _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                        type: 'budget',
                        status: 'draft',
                        reference: reqData.reference,
                        number: 'BORRADOR',
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
                            resolve({ok: budgetObj})
                        } else {
                            resolve({err: 'No se ha podido crear el borrador'})
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
    
                resolve({ok: result.docs[0].count })
            } else {
                resolve({ err: 'No se ha podido crear la cotización.' })
            }
        })
    })
}

export default Budget;
