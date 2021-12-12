const log = require('winston');
var modules = require('../modules');
var config = require('../../../config');


module.exports = (router) => {
    log.info('Initializing Route POST /students');
    router.post('/students',
        modules.verify.body,
        modules.students.validateCreate,
        modules.students.create,
        modules.response);

    // This route should be disabled in production
    if (config.mode !== 'PROD') {
        log.info('Initializing Route GET /students');
        router.get('/students',
            modules.students.getAll,
            modules.response);
    }

    log.info('Initializing Route GET /students/:id');
    router.get('/students/:id',
        modules.verify.token,
        modules.verify.params,
        modules.students.validatePathId,
        modules.students.verifyId,
        modules.students.getOne,
        modules.response);

    log.info('Initializing Route DELETE /students/:id');
    router.delete('/students/:id',
        modules.verify.token,
        modules.verify.params,
        modules.students.validatePathId,
        modules.students.verifyId,
        modules.students.deleteOne,
        modules.response);

    log.info('Initializing Route POST /students/assignments');
    router.post('/students/assignments',
        modules.verify.body,
        modules.students.createAssignments,
        modules.response);

    log.info('Initializing Route POST /students/:id/assignments');
    router.post('/students/:id/assignments',
        modules.verify.token,
        modules.verify.body,
        modules.verify.params,
        modules.students.validatePathId,
        modules.students.verifyId,
        modules.students.validateAssignment,
        modules.students.createAssignment,
        modules.response);

    
    log.info('Initializing Route DELETE /students/:id/assignments/:assignmentId');
    router.delete('/students/:id/assignments/:assignmentId',
        modules.verify.token,
        modules.verify.params,
        modules.students.validatePathId,
        modules.students.validateAssignmentId,
        modules.students.verifyId,
        modules.students.deleteAssignment,
        modules.response);

};