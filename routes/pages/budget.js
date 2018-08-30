export default {
    method: ['GET'],
    path: '/budget',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;

            return h.view('budget', { credentials: credentials })
        }
    }
}