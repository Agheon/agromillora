import Joi from 'joi';
import moment from 'moment-timezone'
import { db } from '../../config/db'

export default [
{ 
    method: 'GET',
    path: '/api/protectedProducts', 
    options: {
        handler: async (request, h) => {
            try {
                let result = await db.find({
                    selector: {
                        _id: {
                            $gt: 0,  
                        },
                        type: 'protectedProduct'
                    }
                })

                if (result.docs[0]) {
                    return { ok: result.docs }
                } else {
                    return { err: 'NO EXISTEN PRODUCTOS PROTEGIDOS' }
                }
            } catch (error) {
                throw error
            }
        }
    }
},
{
    method: 'POST',
    path: '/api/protectedProduct',
    options: {
        handler: async (request, h) => {
            try {
                let originalName = request.payload.originalName.toUpperCase().trim()
                let commercialName = request.payload.commercialName.toUpperCase().trim()

                let result = await db.find({
                    selector: {
                        _id: {
                            $gt: 0
                        },
                        type: 'protectedProduct',
                        $or: [
                            {
                                originalName: originalName,
                            },
                            {
                                commercialName: commercialName    
                            }
                        ]   
                    }
                })

                if(!result.docs[0]) {
                    let newProtectedProduct = {
                        _id: `${moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS')}${Math.floor((Math.random() * 999999999) + 1)}`,
                        type: 'protectedProduct',
                        originalName: originalName,
                        commercialName: commercialName
                    }

                    let insertRes = await db.insert(newProtectedProduct)
                    if(insertRes.ok) {
                        return { ok: newProtectedProduct }
                    } else {
                        return { err: `Ocurrio un error al intentar agregar el producto protegido, por favor recargue la página e intentelo nuevamente.` }
                    }
                } else {
                    return { err: `El nombre original ${originalName} y nombre comercial ${commercialName} solo pueden ser asociados 1 vez.` }
                }

            } catch (error) {
                throw error
            }
        },
        validate: {
            payload: Joi.object().keys({
                originalName: Joi.string().required(),
                commercialName: Joi.string().required()
            })
        }
    }
},
{
    method: 'DELETE',
    path: '/api/protectedProduct',
    options: {
        handler: async (request, h) => {
            try {
                let productID = request.payload.productID

                let result = await db.find({
                    selector: {
                        _id: productID 
                    }
                })

                console.log(result)

                if(result.docs[0]) {
                    let destroyProduct = await db.destroy(result.docs[0]._id, result.docs[0]._rev)

                    if (destroyProduct.ok) {
                        return { ok: `PRODUCTO PROTEGIDO (${result.docs[0].originalName} -> ${result.docs[0].commercialName}) ELIMINADO CORRECTAMENTE`}
                    } else {
                        return { err: `Ocurrio un error al intentar eliminar producto protegido, por favor recargue la página e intentelo nuevamente.` } 
                    }
                } else {
                    return { err: `Ocurrio un error al intentar eliminar producto protegido, por favor recargue la página e intentelo nuevamente.` }
                }

            } catch (error) {
                throw error
            }
        },
        validate: {
            payload: Joi.object().keys({
                productID: Joi.string().required()
            })
        }
    }
}
]