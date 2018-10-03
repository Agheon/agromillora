export default {
    method: ['GET'],
    path: '/stockAvailability',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;

            return h.view('stockAvailability', { credentials: credentials })
        }
    }
}