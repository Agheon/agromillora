export default {
    method: ['GET'],
    path: '/production',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;
            credentials[credentials.role] = true

            if(credentials.role == 'sa') {
                return h.view('production', { credentials: credentials })
            } else if (credentials.role == 'production') {
                return h.view('production', { credentials: credentials })
            } else if (credentials.role == 'commercial') {
                return h.redirect('budget')
            }
        }
    }
}