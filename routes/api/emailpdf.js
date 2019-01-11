import Joi from 'joi'
import nodemailer from 'nodemailer'
import { db } from '../../config/db'
import dotEnv from 'dotenv'
import randtoken from 'rand-token'
dotEnv.load()

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
        handler: (request, h) => {
            let pdf = request.payload.pdf
            let budgetData = JSON.parse(request.payload.budgetData)
            console.log('BUDGET DATA', budgetData)
            
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

                budgetData.acceptToken = randtoken.generate(32);
                mailOptions.html = `
                    En atención a lo solicitado, adjunto la correspondiente cotización y potenciales fechas de entrega.
                    <br>
                    <p>Para aceptar la cotización hacer clic en el siguiente enlace: <a href="${process.env.APP_DOMAIN}/iacceptthequote?token=${budgetData.acceptToken}">ACEPTO LA COTIZACIÓN</a></p>
                    <b>RECUERDE QUE LA COTIZACIÓN PASA A SER UNA RESERVA CUANDO SE TRANSFIERE EL ANTICIPO ESTIPULADO EN EL DOCUMENTO ADJUNTO.</b>
                `

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