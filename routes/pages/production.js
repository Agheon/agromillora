export default {
    method: ['GET'],
    path: '/production',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;

            return h.view('production', { credentials: credentials })
        }
    }
}