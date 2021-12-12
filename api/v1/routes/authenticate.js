const log = require('winston');
var modules = require('../modules');

module.exports = (router) => {
    log.info('Initializing Route POST /authenticate');
    router.post('/authenticate',
        modules.verify.body,
        modules.authenticate.giveToken,
        modules.response);
};