import cron from 'node-cron'
import mysql from 'mysql2/promise'
import moment from 'moment-timezone'
import { db } from '../config/db'

async function main() {
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
          T2.descripcion AS tipobodega,
          T3.almacen As almacen,
          T4.descripcion AS variedad,
          CONCAT(T6.descripcion,' ', T7.descripcion) AS envase,
          SUM(T1.stockactual) As stockactual
          FROM tblstock T1
          LEFT JOIN tbltipoorigendestino T2 ON T1.idtipoorigendestino=T2.idtipoorigendestino
          LEFT JOIN tblorigendestino T3 ON T1.idorigendestino=T3.idorigendestino
          LEFT JOIN tblvariedad T4 ON T1.idvariedad=T4.idvariedad
          LEFT JOIN tblenvase T5 ON T1.idenvase=T5.idenvase
          LEFT JOIN tbltipoenvase T6 ON T5.idtipoenvase=T6.idtipoenvase
          LEFT JOIN tblmedidaenvase T7 ON T5.idmedidaenvase=T7.idmedidaenvase
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


let dailyCron = cron.schedule('*/50 * * * * *', async function(){ // una vez al día a las 12 AM
    
    main().then(res=>{
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
                db.insert(products).then(resUpdate=>{
                    if(resUpdate.ok) {
                        console.log(resUpdate)
                    }
                })
            }
        })
        console.log(res)
    })
    
})


export default dailyCron