const log = require('winston');
var modules = require('../modules');

module.exports = (router) => {
    log.info('Initializing Route POST /assignments');
    router.post('/assignments',
        modules.verify.token,
        modules.verify.body,
        modules.assignments.validateCreate,
        modules.assignments.create,
        modules.response);

    log.info('Initializing Route GET /assignments');
    router.get('/assignments',
        modules.verify.token,
        modules.assignments.getAll,
        modules.response);

    log.info('Initializing Route GET /assignments/:id');
    router.get('/assignments/:id',
        modules.verify.token,
        modules.verify.params,
        modules.assignments.validatePathId,
        modules.assignments.getOne,
        modules.response);

    log.info('Initializing Route DELETE /assignments/:id');
    router.delete('/assignments/:id',
        modules.verify.token,
        modules.verify.params,
        modules.assignments.validatePathId,
        modules.assignments.deleteOne,
        modules.response);
};