import md5 from 'md5'
import { db } from '../../config/db'
import { ktoK, cleanRut } from '../../tools'

let uuid = 1 // Use seq instead of proper unique identifiers for demo only

const findUser = async (rut, password) => {
  return new Promise((resolve) => {
    db.find({
        selector: {
          _id: ktoK(cleanRut(rut)),
          password: password,
          status: 'enabled',
          type: 'user'
        }
    }).then(res => {
        console.log(res)
        if (res.docs[0]) {
            let data = res.docs[0]
            if (data.password === password) {
                resolve(data)
            } else {
                resolve(null)
            }
        } else {
            resolve(null)
        }
    }).catch(function(err) {
        console.log('something went wrong', err)
    })
  })
}



const Login = {
    method: ['GET', 'POST'],
    path: '/login',
    options: {
      handler: async (request, h) => {
        if (request.auth.isAuthenticated) return h.redirect('/')
      
        let account = null
      
        if (request.method === 'post') {
          if (!request.payload.rut || !request.payload.password) {
            return h.view('login', {message: 'Rut o contraseña incorrecto.'}, { layout: false })
          } else {
            account = await findUser(request.payload.rut, md5(request.payload.password))
            if (!account) {
              return h.view('login', {message: 'Rut o contraseña incorrecto.'}, { layout: false })
            } else {
              const sid = String(++uuid)
              account.rut = account._id
              delete account._id
              delete account.password
              delete account._rev
              await request.server.app.cache.set(sid, { account }, 0)
              request.cookieAuth.set({ sid })
              return h.redirect('/')
            }
          }
        }
      
        if (request.method === 'get') return h.view('login', {title: 'test'}, { layout: false })
      },
      auth: { mode: 'try' },
      plugins: { 'hapi-auth-cookie': { redirectTo: false } }
    }
}

export default Login