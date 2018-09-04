import Joi from 'joi';
import moment from 'moment-timezone'
import { db } from '../../config/db'

const Layout = [
{ 
    method: 'GET',
    path: '/api/layout/getAll', 
    options: {
        handler: (request, h) => {
            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'layout' 
                    }
                }).then(result => {
                    if (result.docs[0]) {

                        resolve({ok: result.docs })
                    } else {
                        resolve({ err: 'No existen plantillas de presupuesto' })
                    }
                })
            })
        }
    }
},
{
    method: 'PUT',
    path: '/api/template',
    options: {
        handler: (request, h) => {
            let reqData = {}
            reqData.originalLayoutName = request.payload.originalLayoutName
            reqData.newLayoutName = request.payload.newLayoutName
            reqData.textInfoTitle = request.payload.textInfoTitle
            reqData.checkingAccountTitle = request.payload.checkingAccountTitle
            reqData.textInfo = request.payload.textInfo
            reqData.advancePercent = request.payload.advancePercent
            reqData.checkingAccount = JSON.parse(request.payload.checkingAccount)
            reqData.generalInfo = JSON.parse(request.payload.generalInfo)
            reqData.divisa = request.payload.divisa

            return new Promise(resolve => {
                db.find({
                    selector: {
                        _id: {
                            $gt: null
                        },
                        type: 'layout',
                        layoutName: reqData.originalLayoutName
                    }
                }).then(result => {
                    if (result.docs[0]) {
                        let originalLayout = result.docs[0]

                        originalLayout.layoutName = reqData.newLayoutName
                        originalLayout.textInfoTitle = reqData.textInfoTitle
                        originalLayout.textInfo = reqData.textInfo
                        originalLayout.generalInfo = reqData.generalInfo
                        originalLayout.advancePercent = reqData.advancePercent
                        originalLayout.checkingAccount.title = reqData.checkingAccountTitle
                        originalLayout.checkingAccount.content = reqData.checkingAccount
                        originalLayout.divisa = reqData.divisa
                        

                        db.insert(originalLayout).then(modRes=>{
                            if(modRes.ok) {
                                resolve({ok: originalLayout})
                            } else {
                                resolve({err: 'No se ha podido modificar la plantilla.'})
                            }
                        })

                        console.log(result.docs[0])
                    } else {
                        resolve({ err: 'No existen plantillas de presupuesto' })
                    }
                })
            });
        },
        validate: {
            payload: Joi.object().keys({
                originalLayoutName: Joi.string().required(),
                newLayoutName: Joi.string().required(),
                textInfoTitle: Joi.string().required(),
                textInfo: Joi.string().required(),
                checkingAccount: Joi.string().required(),
                advancePercent: Joi.string().required(),
                checkingAccountTitle: Joi.string().required(),
                generalInfo: Joi.string().required(),
                divisa: Joi.string().required(),
            })
        }
    }
}
]

export default Layout;
