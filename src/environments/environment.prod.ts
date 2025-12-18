export const environment = {
  production: true,
  auth0: {
    domain: 'dev-mit-indbo.eu.auth0.com',
    clientId: 'OET9UkXK9OgQBQyS8iy2kb5bfgkRdj9K',
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: 'mit-indbo-backend'
    },
    httpInterceptor: {
      allowedList: [
        {
          uri: 'http://127.0.0.1:8080/*',
          tokenOptions: {
            authorizationParams: {
              audience: 'mit-indbo-backend'
            }
          }
        }
      ]
    }
  },
  apiUrl: 'http://127.0.0.1:8080'
};

