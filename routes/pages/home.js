const Home = {
    method: ['GET'],
    path: '/',
    options: {
        handler: (request, h) => {
            let credentials = request.auth.credentials;

            return h.view('home', { credentials: credentials })
        }
    }
};

export default Home