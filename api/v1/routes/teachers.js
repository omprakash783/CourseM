const log = require('winston');
var modules = require('../modules');
var config = require('../../../config')


module.exports = (router) => {
    log.info('Initializing Route POST /teachers');
    router.post('/teachers',
        modules.verify.body,
        modules.teachers.validateCreate,
        modules.teachers.create,
        modules.response);

    // This route should be disabled in production
    if (config.mode !== 'PROD') {
        log.info('Initializing Route GET /teachers');
        router.get('/teachers',
            modules.teachers.getAll,
            modules.response);
    }

    log.info('Initializing Route GET /teachers/:id');
    router.get('/teachers/:id',
        modules.verify.token,
        modules.verify.params,
        modules.teachers.validatePathId,
        modules.teachers.verifyId,
        modules.teachers.getOne,
        modules.response);

    log.info('Initializing Route DELETE /teachers/:id');
    router.delete('/teachers/:id',
        modules.verify.token,
        modules.verify.params,
        modules.teachers.validatePathId,
        modules.teachers.verifyId,
        modules.teachers.deleteOne,
        modules.response);

};