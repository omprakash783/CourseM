module.exports = {
    mode: 'DEV', // [DEVELOPMENT/PRODUCTION]
    log: 'courseM-api.log',
    tokenSecret: '',
    dev: {
      port: 8081,
      host: 'localhost',
      protocol: 'http',
      database: {
        user: '',
        password: '',
        host: '',
        port: 0,
        name: ''
      }
    },
    prod: {
      port: 440,
      host: 'course.com',
      protocol: 'https',
      database: {
        user: '',
        password: '',
        host: '',
        port: 0,
        name: ''
      }
    },
    api: {
      version: 'v1'
    }
};