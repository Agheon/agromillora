export default {
    method: ['GET'],
    path: '/stockAvailability',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            credentials[credentials.role] = true

            if(credentials.role == 'sa') {
                return h.view('stockAvailability', { credentials: credentials })
            } else if (credentials.role == 'production') {
                return h.redirect('production')
            } else if (credentials.role == 'commercial') {
                return h.view('stockAvailability', { credentials: credentials })    
            }
        }
    }
}