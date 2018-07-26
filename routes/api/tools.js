import moment from 'moment-timezone'

const Tools = [
{ // Verificar sesión
    method: ['GET'],
    path: '/api/tools/check', 
    options: {
        handler: (request, h) => {
            return true
        }
    }
},
{ // Hora del servidor
    method: 'GET',
    path: '/api/tools/getServerTime',
    options: {
      handler: (request, h) => {
        return new Promise(resolve => {
          resolve(moment().tz('America/Santiago').format('YYYY-MM-DDTHH:mm:ss.SSSSS'))
        })
      }
    }
}];

export default Tools