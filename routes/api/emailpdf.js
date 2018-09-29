import Joi from 'joi'
import nodemailer from 'nodemailer'
import { db } from '../../config/db'
import dotEnv from 'dotenv'
dotEnv.load()

let config = {
    from: `Agromillora. <cotizacionsur@agromillora.com>`,
    to: ['cotizacionsur@agromillora.com', 'ereveco@michcom.cl'],
    subject: 'Cotización'
}

let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // use TLS
    auth: {
        user: process.env.EMAIL_USER, // .env para commit
        pass: process.env.SERVER_PASSWORD // .env para commit
    },
    tls: {
        // do not fail on invalid certs
        //rejectUnauthorized: false
        ciphers: 'SSLv3'
    }
})

let mailOptions = {
    from: config.from, 
    to: config.to, // emails de destino
    subject: config.subject, 
    html: `En atención a lo solicitado, adjunto la correspondiente cotización y potenciales fechas de entrega.` 
}

const pdfExport = [
{
    method: 'POST',
    path: '/api/savePdf',
    options: {
        handler: (request, h) => {
            let pdf = request.payload.pdf
            let budgetData = JSON.parse(request.payload.budgetData)
            console.log(budgetData)
            return new Promise(resolve => {

                mailOptions.attachments = [{
                    filename: `COT${budgetData.number}.pdf`,
                    content: pdf,
                    encoding: 'base64'
                }]
                
                transporter.sendMail(mailOptions, function (err, info) {           
                    if (!err) {
                        console.log(info)
                        budgetData.status = 'sended'
                        db.insert(budgetData).then(updateRes=>{
                            if(updateRes.ok) {
                                budgetData.emailInfo = info
                                resolve({ok: budgetData})
                            }
                        })
                        
                        //resolve({ok: 'Correo enviado correctamente'});
                    } else {
                        console.log(err)
                        budgetData.emailInfo = err
                        resolve({err: budgetData})
                        //resolve({err: 'No se pudo enviar el correo'});
                    }               
                })

            })
        },
        validate: {
            payload: Joi.object().keys({
                pdf: Joi.string().required(),
                budgetData: Joi.string().required()
            })
        }
    }
}
]

export default pdfExport