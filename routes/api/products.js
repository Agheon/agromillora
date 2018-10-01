import Joi from 'joi';
import moment from 'moment-timezone'
import { db } from '../../config/db'
import { comma_format, capitalizeFirst } from '../../tools'

const Products = [
{ 
    method: 'GET',
    path: '/api/products/getAllProducts', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: 'products'
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        resolve({ok: result.docs[0] })
                    } else {
                        resolve({ err: 'NO EXISTEN PRODUCTOS' })
                    }
                })
            })
        }
    }
},
{ 
    method: 'GET',
    path: '/api/product/getAll', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: 0
                        },
                        type: 'product',
                        status: 'enabled'
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        
                        let products = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                name: `<b>${el.name.toUpperCase()}</b>`,
                                type: capitalizeFirst(el.type_product),
                                price: comma_format(el.price),
                                stock: comma_format(el.stock)
                            })
                        }, []) 
                        
                        resolve({ok: products })
                    } else {
                        resolve({ err: 'NO EXISTEN PRODUCTOS' })
                    }
                })
            })
        }
    }
},
{ 
    method: 'GET',
    path: '/api/product/getAllDisabled', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: 0
                        },
                        type: 'product',
                        status: 'disabled'
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        
                        let products = result.docs.reduce((arr, el, i)=>{
                            return arr.concat({
                                name: `<b>${el.name.toUpperCase()}</b>`,
                                type: capitalizeFirst(el.type_product),
                                price: comma_format(el.price),
                                stock: comma_format(el.stock)
                            })
                        }, []) 
                        
                        resolve({ok: products })
                    } else {
                        resolve({ err: 'NO EXISTEN PRODUCTOS DESHABILITADOS' })
                    }
                })
            })
        }
    }
},
{ 
    method: 'GET',
    path: '/api/product/getAllTypes', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: 'type_products'
                    }
                }).then(result => {
                    if (result.docs[0].types[0]) {
                        resolve({ok: result.docs[0].types })
                    } else {
                        resolve({ err: 'NO EXISTEN TIPOS DE PRODUCTOS' })
                    }
                })
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/product/saveTypes',
    options: {
        handler: (request, h) => {
            let types = JSON.parse(request.payload.types)
            
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: 'type_products'
                    }
                }).then(result => {
                    if (result.docs[0]) {
                        result.docs[0].types = types
                        
                        db.insert(result.docs[0]).then(res=>{
                            resolve({ok: 'TIPOS DE PRODUCTOS MODIFICADOS CORRECTAMENTE'})
                        })

                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                types: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/product/newProduct',
    options: {
        handler: (request, h) => {
            let name  = request.payload.name
            let price = request.payload.price
            let stock = request.payload.stock
            let type  = request.payload.type
            
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: 0
                        },
                        type: 'product',
                        name: name,
                        type_product: type
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        resolve({err: `YA EXISTE EL PRODUCTO DE NOMBRE <b>${name}</b> y tipo <b>${type}</b>`})
                    } else {
                        let newProductObj = {
                            _id: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                            type: 'product',
                            status: 'enabled',
                            name: name,
                            type_product: type,
                            stock: stock,
                            price: price
                        }
                        db.insert(newProductObj).then(insertRes=>{
                            if(insertRes.ok) {
                                resolve({ok: `PRODUCTO <b>${type} ${name}</b> AGREGADO CORRECTAMENTE`})
                            }
                        })
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                name: Joi.string().required(),
                price: Joi.string().required(),
                stock: Joi.string().required(),
                type: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/product/modProduct',
    options: {
        handler: (request, h) => {
            let originalName  = request.payload.originalName
            let originalType  = request.payload.originalType
            let name          = request.payload.name
            let price         = request.payload.price
            let stock         = request.payload.stock
            let type          = request.payload.type
            
            console.log(originalName, originalType)
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: 0
                        },
                        type: 'product',
                        name: originalName,
                        type_product: originalType
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) { // existe el original por lo tanto puedo modificarlo
                        let modProductObj = result.docs[0]
                        db.find({ // busco si ya existe el producto con el nombre y tipo a modificar 
                            selector: {
                                _id: {
                                    $gt: 0
                                },
                                type: 'product',
                                name: name,
                                type_product: type
                            }
                        }).then(result2 => {
                            if(result2.docs[0]) {
                                if(result2.docs[0].status == 'disabled') {
                                    resolve({err: `PRODUCTO <b>${type} ${name}</b> YA EXISTE <b>EN ESTADO DESHABILITADO</b>`})
                                } else {
                                    resolve({err: `PRODUCTO <b>${type} ${name}</b> YA EXISTE <b>EN ESTADO HABILITADO</b>`})
                                }   
                            } else {
                                console.log(modProductObj)
                                modProductObj.name          = name
                                modProductObj.type_product  = type
                                modProductObj.price         = price
                                modProductObj.stock         = stock

                                db.insert(modProductObj).then(modRes=>{
                                    if(modRes.ok) {
                                        resolve({ok: `PRODUCTO <b>${type} ${name}</b> MODIFICADO CORRECTAMENTE`})
                                    }
                                })
                            }
                            
                        })
                        
                    } else { // no existe el original por lo tanto no puedo modificarlo
                        resolve({err: `NO EXISTE EL PRODUCTO DE NOMBRE <b>${originalName}</b> y tipo <b>${originalType}</b>`})
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                originalName: Joi.string().required(),
                originalType: Joi.string().required(),
                name: Joi.string().required(),
                price: Joi.string().required(),
                stock: Joi.string().required(),
                type: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/product/disable',
    options: {
        handler: (request, h) => {
            let name  = request.payload.name
            let type  = request.payload.type
            console.log(name, type)
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: 0
                        },
                        type: 'product',
                        name: name,
                        type_product: type
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        let productObj = result.docs[0]
                        productObj.status = 'disabled'

                        db.insert(productObj).then(disableRes=>{
                            if(disableRes.ok) {
                                resolve({ok: `PRODUCTO <b>${type} ${name}</b> DESHABILITADO CORRECTAMENTE`})
                            }
                        })
                    } else {
                        resolve({err: `NO SE ENCUENTRA EL PRODUCTO`})
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                name: Joi.string().required(),
                type: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/product/delete',
    options: {
        handler: (request, h) => {
            let name  = request.payload.name
            let type  = request.payload.type
            console.log(name, type)
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: 0
                        },
                        type: 'product',
                        name: name,
                        type_product: type
                    }
                }).then(result => {
                    if (result.docs[0]) {
                        let productObj = result.docs[0]

                        db.destroy(productObj._id,productObj._rev).then(deleteRes=>{
                            if(deleteRes.ok) {
                                resolve({ok: `PRODUCTO <b>${type} ${name}</b> ELIMINADO CORRECTAMENTE`})
                            }
                        })
                    } else {
                        resolve({err: `NO SE ENCUENTRA EL PRODUCTO`})
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                name: Joi.string().required(),
                type: Joi.string().required()
            })
        }
    }
},
{
    method: 'POST',
    path: '/api/product/enable',
    options: {
        handler: (request, h) => {
            let name  = request.payload.name
            let type  = request.payload.type
            console.log(name, type)
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: 0
                        },
                        type: 'product',
                        name: name,
                        type_product: type
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        let productObj = result.docs[0]
                        productObj.status = 'enabled'

                        db.insert(productObj).then(enableRes=>{
                            if(enableRes.ok) {
                                resolve({ok: `PRODUCTO <b>${type} ${name}</b> HABILITADO CORRECTAMENTE`})
                            }
                        })
                    } else {
                        resolve({err: `NO SE ENCUENTRA EL PRODUCTO`})
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                name: Joi.string().required(),
                type: Joi.string().required()
            })
        }
    }
}
]

export default Products;