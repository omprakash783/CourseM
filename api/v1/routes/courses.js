const log = require('winston');
var modules = require('../modules');
var config = require('../../../config');

module.exports = (router) => {
    log.info('Initializing Route POST /courses');
    router.post('/courses',
        modules.verify.body,
        modules.courses.validateCreate,
        modules.courses.create,
        modules.response);

    // This route should be disabled in production
    if (config.mode !== 'PROD') {
        log.info('Initializing Route GET /courses');
        router.get('/courses',
            modules.courses.getAll,
            modules.response);
    }

    log.info('Initializing Route GET /courses/:id');
    router.get('/courses/:id',
        modules.verify.token,
        modules.verify.params,
        modules.courses.validatePathId,
        modules.courses.verifyTeacherOrStudent,
        modules.courses.getOne,
        modules.response);

    log.info('Initializing Route DELETE /courses/:id');
    router.delete('/courses/:id',
        modules.verify.token,
        modules.verify.params,
        modules.courses.validatePathId,
        modules.courses.verifyTeacher,
        modules.courses.deleteOne,
        modules.response);


    // Starts and creates an attendance
    log.info('Initializing Route POST /courses/:id/attendances');
    router.post('/courses/:id/attendances',
        modules.verify.token,
        modules.verify.params,
        modules.courses.validatePathId,
        modules.courses.verifyTeacher,
        modules.courses.validateAttendanceCreation,
        modules.courses.createAttendance,
        modules.response);

    // Stops an attendance
    log.info('Initializing Route POST /courses/:id/attendances/:attendanceId/stop');
    router.post('/courses/:id/attendances/:attendanceId/stop',
        modules.verify.token,
        modules.verify.params,
        modules.courses.validatePathId,
        //modules.courses.validateAttendanceId,
        modules.courses.verifyTeacher,
        modules.courses.stopAttendance,
        modules.response);

    // Starts an attendance
    log.info('Initializing Route POST /courses/:id/attendances/:attendanceId/start');
    router.post('/courses/:id/attendances/:attendanceId/start',
        modules.verify.token,
        modules.verify.params,
        modules.courses.validatePathId,
        //modules.courses.validateAttendanceId,
        modules.courses.verifyTeacher,
        modules.courses.startAttendance,
        modules.response);

    log.info('Initializing Route GET /courses/:id/attendances');
    router.get('/courses/:id/attendances',
        modules.verify.token,
        modules.verify.params,
        modules.courses.validatePathId,
        modules.courses.verifyTeacherOrStudent,
        modules.courses.getAllAttendances,
        modules.response);

    log.info('Initializing Route GET /courses/:id/students/:studentId/signIn');
    router.post('/courses/:id/students/:studentId/signIn',
        modules.verify.token,
        modules.verify.params,
        modules.courses.validatePathId,
        modules.courses.studentSignIn,
        modules.response);

    log.info('Initializing Route GET /courses/:id/students');
    router.get('/courses/:id/students',
        modules.verify.token,
        modules.verify.params,
        modules.courses.validatePathId,
        modules.courses.verifyTeacher,
        modules.courses.getAllStudents,
        modules.response);
};