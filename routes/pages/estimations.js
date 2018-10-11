export default {
    method: ['GET'],
    path: '/estimations',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;

            return h.view('estimations', { credentials: credentials })
        }
    }
}