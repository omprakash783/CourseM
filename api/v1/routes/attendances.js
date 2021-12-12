const log = require('winston');
var modules = require('../modules');
var config = require('../../../config');

module.exports = (router) => {
    // This route should be disabled in production
    if (config.mode !== 'PROD') {
        log.info('Initializing Route GET /attendances');
        router.get('/attendances',
            modules.attendances.getAll,
            modules.response);

        log.info('Initializing Route GET /attendances/:id');
        router.get('/attendances/:id',
            modules.verify.params,
            modules.attendances.validatePathId,
            modules.attendances.getOne,
            modules.response);

        log.info('Initializing Route DELETE /attendances/:id');
        router.delete('/attendances/:id',
            modules.verify.params,
            modules.attendances.validatePathId,
            modules.attendances.deleteOne,
            modules.response);
    }
};