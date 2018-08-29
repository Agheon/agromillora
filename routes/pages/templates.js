const Templates = {
    method: ['GET'],
    path: '/templates',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;

            return h.view('templates', { credentials: credentials })
        }
    }
};

export default Templates