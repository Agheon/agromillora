import Joi from 'joi'
import nodemailer from 'nodemailer'
import { db } from '../../config/db'
import dotEnv from 'dotenv'
import randtoken from 'rand-token'
//import qrcode from 'qrcode-js' //borrar!
import yaqr from 'yaqrcode'

dotEnv.load()

const urlQR = process.env.APP_DOMAIN

let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // use TLS
    auth: {
        user: process.env.EMAIL_USER, // .env para commit
        pass: process.env.EMAIL_PASSWORD // .env para commit
    },
    tls: {
        // do not fail on invalid certs
        //rejectUnauthorized: false
        ciphers: 'SSLv3'
    }
})

const pdfExport = [
{
    method: 'POST',
    path: '/api/savePdf',
    options: {
        payload: {
            maxBytes: 1000 * 1000 * 10 // 10mb
        },
        handler: async (request, h) => {
            try {
                let pdf = request.payload.pdf
                let budgetData = JSON.parse(request.payload.budgetData)
                //console.log('BUDGET DATA', budgetData)
                /*
                    Se tienen que generar tokens por separado por seguridad
                */
                budgetData.acceptToken = await randtoken.generate(32) // para aceptar la cotización
                
                /*
                budgetData.getToken = await randtoken.generate(32) // para ver la cotización

                //console.log(`${urlQR}/getBudget/${budgetData.getToken}`)

                budgetData.qrCode = await yaqr(`${urlQR}/getBudget/${budgetData.getToken}`, {
                    size: 200
                })
                */

                //console.log('QRCODE', budgetData.qrCode)

                return new Promise(resolve => {

                    let mailOptions = {
                        from: `Agromillora. <cotizacionsur@agromillora.com>`, 
                        to: ['cotizacionsur@agromillora.com'], // emails de destino
                        subject: 'Cotización'
                    }

                    mailOptions.to.push(`Cliente <${budgetData.client.email.trim()}>`)
                    mailOptions.to.push(`Comercial <${budgetData.user.email.trim()}>`)

                    mailOptions.attachments = [{
                        filename: `COT${budgetData.number}.pdf`,
                        content: pdf,
                        encoding: 'base64'
                    }]

                    mailOptions.html = `
                        En atención a lo solicitado, adjunto la correspondiente cotización y potenciales fechas de entrega.
                        <br>
                        <p>Para aceptar la cotización hacer clic en el siguiente enlace: <a href="${process.env.APP_DOMAIN}/iacceptthequote?token=${budgetData.acceptToken}">ACEPTO LA COTIZACIÓN</a></p>
                        <b>RECUERDE QUE LA COTIZACIÓN PASA A SER UNA RESERVA CUANDO SE TRANSFIERE EL ANTICIPO ESTIPULADO EN EL DOCUMENTO ADJUNTO.</b>
                    `

                    transporter.sendMail(mailOptions, function (err, info) {           
                        if (!err) {
                            //console.log(info)
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
            } catch (error) {
                throw error
            }
            
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