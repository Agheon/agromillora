import Joi from 'joi';
import moment from 'moment-timezone'
import { db } from '../../config/db'
import { comma_format, capitalizeFirst } from '../../tools'

const Products = [
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
                                resolve({ok: `PRODUCTO <b>${name}</b> AGREGADO CORRECTAMENTE`})
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
}
]

export default Products;