import Hapi from 'hapi'
import Vision from 'vision'
import Handlebars from 'handlebars'
import Extend from 'handlebars-extend-block'
import Inert from 'inert'
import hapiRouter from 'hapi-router'
import hapiAuthCookie from 'hapi-auth-cookie'
import moment from 'moment'
import dotEnv from 'dotenv'
import updateDaily from './cronJobs/updateDaily' // CRON JOB
dotEnv.load()

const server = Hapi.server({
    host: '0.0.0.0',
    port: process.env.SERVER_PORT
})
  
const init = async () => {

    try {
        await server.register([
            Vision,
            Inert,
            hapiAuthCookie
        ])
    } catch (err) {
        throw err
    }

    try {
        const cache = server.cache({ segment: 'sessions', expiresIn: moment.duration(100, 'hours').asMilliseconds() })
        server.app.cache = cache

        server.auth.strategy('session', 'cookie', {
            password: 'password-should-be-32-characters',
            cookie: 'sid-agromillora',
            redirectTo: '/login',
            isSecure: false,
            validateFunc: async (request, session) => {
                const cached = await cache.get(session.sid)
                const out = {
                    valid: !!cached
                }

                if (out.valid) {
                    out.credentials = cached.account
                }

                return out
            }
        })

        server.auth.default('session')
    } catch (err) {
        throw `ERROR IN SESSION (COOKIE): ${err}`
    }
    
    try {
        await server.register({
            plugin: hapiRouter,
            options: {
                routes: 'routes/**/*.js'
            }
        })
    } catch (err) {
        throw `ERROR IN ROUTES: ${err}`
    }

    try {
        await server.views({
            engines: {
              html: {
                module: Extend(Handlebars),
                isCached: false
              }
            },
            path: 'views',
            layoutPath: 'views/layout',
            layout: 'default'
        })    
    } catch (err) {
        throw `ERROR IN VIEWS: ${err}`
    }
    

    await server.start()
    console.log(`Server started listening on ${server.info.uri}`)
    process.on('unhandledRejection', (err) => {       
        console.log(err) 
        process.exit(1)    
    })
}


init()