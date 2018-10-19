import Joi from 'joi';
import { db } from '../../config/db'
import moment from 'moment-timezone'

export default [
{
    method: 'POST',
    path: '/api/saveCart',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            let toInvoiceCart = JSON.parse(request.payload.toInvoiceArrStr)
            
            console.log(credentials, toInvoiceCart)
            return new Promise(resolve => {
                
                db.find({
                    selector: {
                        _id: credentials.rut,
                        type: 'user'
                    }
                }).then(result => {
                    console.log(result)
                    if (result.docs[0]) {
                        result.docs[0].cart = {
                            creationDate: moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                            products: toInvoiceCart
                        }

                        db.insert(result.docs[0]).then(cartRes=>{
                            if(cartRes.ok) {
                                resolve({ok: result.docs[0].cart})
                            } else {
                                resolve({err: 'No se ha podido agregar los productos al carrito, por favor vuelva a intentarlo nuevamente.'})
                            }
                        })
                    } else {
                        resolve({err: 'No se ha podido agregar los productos al carrito, por favor vuelva a intentarlo nuevamente.'})
                    }
                })
                
            });
        },
        validate: {
            payload: Joi.object().keys({
                toInvoiceArrStr: Joi.string().required()
            })
        }
    }
},
{ 
    method: 'GET',
    path: '/api/getCart', 
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            
            return new Promise(resolve => {
                
                db.find({
                    selector: {
                        _id: credentials.rut,
                        type: 'user'
                    }
                }).then(result => {
                    if (result.docs[0]) {
                        if(result.docs[0].cart) {
                            resolve({ok: result.docs[0].cart})
                        } else {
                            resolve({empty: 'El usuario no tiene productos en el carrito'})
                        }
                        
                    } else {
                        resolve({err: 'No se ha encontrado información del usuario, por favor contacte con un administrador.'})
                    }
                })
                
            });
        }
    }
}
]

