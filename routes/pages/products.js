export default {
    method: ['GET'],
    path: '/products',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            credentials[credentials.role] = true
            
            return h.view('products', { credentials: credentials })
        }
    }
}