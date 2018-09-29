import cron from 'node-cron'
import mysql from 'mysql2/promise'


function main() {
    return new Promise(resolve=>{

    })

    let connection = null
    connection = await mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      password : '1234',
      database : 'bddeepblue'
    }).catch(e=>{
      console.log('ERROR DE ACCESO A BASE DE DATOS')
    })
  
    if(connection) {
      let [rows, fields] = await connection.execute(`
        SELECT
        T2.descripcion AS tipobodega,
        T3.almacen,
        T4.descripcion AS variedad,
        CONCAT(T6.descripcion,' ', T7.descripcion) AS envase,
        SUM(T1.stockactual) AS stock
        FROM tblstock T1 
        LEFT JOIN tbltipoorigendestino T2 ON T1.idtipoorigendestino=T2.idtipoorigendestino 
        LEFT JOIN tblorigendestino T3 ON T1.idorigendestino=T3.idorigendestino 
        LEFT JOIN tblvariedad T4 ON T1.idvariedad=T4.idvariedad 
        LEFT JOIN tblenvase T5 ON T1.idenvase=T5.idenvase 
        LEFT JOIN tbltipoenvase T6 ON T5.idtipoenvase=T6.idtipoenvase 
        LEFT JOIN tblmedidaenvase T7 ON T5.idmedidaenvase=T7.idmedidaenvase
        GROUP BY variedad, T6.idtipoenvase, T7.idmedidaenvase;
      `).catch(e=>{
        // retornar error
        console.log('ERROR EN LA CONSULTA A LA BASE DE DATOS') 
      })
  
      if(rows) {
        //console.log(rows)
        connection.end()
        return rows
        // retornar productos
      }
      
    } else {
      // retornar error
      console.log('TAAAAAAAAA')
    }
}

let dailyCron = cron.schedule('* * * * * *', async function(){ // una vez al día a las 0 AM
    let test = main()
    console.log(test)
})

export default dailyCron