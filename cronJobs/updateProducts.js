import cron from 'node-cron'
import mysql from 'mysql2/promise'
import mssql from 'mssql'
import moment from 'moment-timezone'
import { db } from '../config/db'

async function updateProducts() {
    let connection = null

    try {
        connection = await mysql.createConnection({
            host     : '190.100.85.14',
            user     : 'root',
            password : '1234',
            database : 'bddeepblue'
        })
    
        if(connection) {
          let [rows, fields] = await connection.execute(`
            SELECT
            T9.descripcion AS area,
            T8.descripcion AS especie,
            T2.descripcion AS tipobodega,
            T3.almacen As almacen,
            T4.idvariedad AS idvariedad,
            T4.descripcion AS variedad,
            T6.descripcion AS soloEnvase,
            CONCAT(T6.descripcion,' ', T7.descripcion) AS envase,
            SUM(T1.stockactual) As stockactual
            FROM tblstock T1
            LEFT JOIN tbltipoorigendestino T2 ON T1.idtipoorigendestino=T2.idtipoorigendestino
            LEFT JOIN tblorigendestino T3 ON T1.idorigendestino=T3.idorigendestino
            LEFT JOIN tblvariedad T4 ON T1.idvariedad=T4.idvariedad
            LEFT JOIN tblenvase T5 ON T1.idenvase=T5.idenvase
            LEFT JOIN tbltipoenvase T6 ON T5.idtipoenvase=T6.idtipoenvase
            LEFT JOIN tblmedidaenvase T7 ON T5.idmedidaenvase=T7.idmedidaenvase
            LEFT JOIN tblespecie T8 ON T4.idespecie=T8.idespecie
            LEFT JOIN tblarea T9 ON T5.idarea=T9.idarea
            GROUP BY
            T2.descripcion,
            T3.almacen,
            T4.descripcion,
            T6.descripcion,
            T7.descripcion
          `)
      
          if(rows) {
            //console.log(rows)
            connection.end()
            return rows
            // retornar productos
          }
          
        }    
    } catch (error) {
        console.log(error)
    }
    
}

function updateClients() {
    return new Promise(resolve=> {
        mssql.connect('mssql://sa:local1234@192.168.0.115/NAVISION').then(pool=>{
            return pool.request()
            .query(`
                SELECT
                No_,
                Name,
                Address,
                County,
                City,
                [Phone No_],
                [E-Mail]
                FROM [Agromillora real$Customer]
            `)
        }).then(result => {
            mssql.close()
            resolve({ok: result.recordset})
        }).catch(err=> {
            console.log('ERROR: ',err)
            mssql.close()
            resolve({err: 'No se han actualizado los clientes'})
        })
    })

    
}


let dailyCron = cron.schedule('0 0 0 * * *', async function(){ // una vez al día a las 12 AM
    
    updateProducts().then(res=>{
        //aqui guardar en base de datos
        db.find({
            selector: {
                _id: 'products'
            }
        }).then(result => {
            if (result.docs[0]) {
                let products = result.docs[0]

                products.lastUpdate = moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                products.list = res
                try {
                    db.insert(products).then(resUpdate=>{
                        if(resUpdate.ok) {
                            console.log(resUpdate)
                        }
                    }) 
                } catch (error) {
                    console.log(error)
                }
                
            }
        })
    })

    updateClients().then(res=>{
        if(res.ok) {
            db.find({
                selector: {
                    _id: 'clients'
                }
            }).then(result => {
                if (result.docs[0]) {
                    let clients = result.docs[0]
    
                    clients.lastUpdate = moment.tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'),
                    clients.list = res.ok
                    try {
                        db.insert(clients).then(resUpdate=>{
                            if(resUpdate.ok) {
                                console.log(resUpdate)
                            }
                        }) 
                    } catch (error) {
                        console.log(error)
                    }
                    
                }
            })
        }

    })
    
})


export default dailyCron