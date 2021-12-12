const log = require('winston');
var ctrls = require('../controllers');
var models = require('../models');

module.exports = {
    //Valiate the schema before creating a course
    validateCreate: (req, res, next) => {
        log.info('Module - ValidateCreate Course');

        // Validate schema
        log.info('Validating course model...')
        var course = new models.courses(req.body);
        var error = course.validateSync();

        if (error) {
            log.error('course model validation failed!');
            let err = new Error('Course Validation Failed!');
            err.status = 400;
            // Remove stack trace but keep detailed description of validation errors
            err.data = JSON.parse(JSON.stringify(error));
            next(err);
            return;
        }

        log.info('Course model has been validated!');
        next();
    },
    
    //Create a new course
    create: (req, res, next) => {
        log.info('Module - Create Course');
        var course = new models.courses(req.body);
        ctrls.mongodb.save(course, (err, courseData) => {
            if (err) {
                let err = new Error('Failed creating course!');
                err.status = 500;
                next(err);
                return;
            }
            ctrls.mongodb.findById(models.teachers, courseData.teacher, (err, teacherData) => {
                if (err) {
                    log.error('Failed adding course to teacher [' + courseData.teacher + ']');
                    return;
                }
                log.info('Successfully found teacher [' + courseData.teacher + ']');

                log.info('Adding course to teacher');
                teacherData.courses.push(courseData._id);

                ctrls.mongodb.save(teacherData, (err, _result) => {
                    if (err) {
                        log.error('Failed adding course to teacher [' + courseData.teacher + ']');
                        return;
                    }
                    log.info('Successfully added teacher to course');
                });
            });

            for (let i = 0; i < courseData.students.length; i++) {
                ctrls.mongodb.findById(models.students, courseData.students[i], (err, studentData) => {
                    if (err) {
                        log.error('Failed adding course to student [' + courseData.students[i] + ']');
                        return;
                    }
                    log.info('Successfully found student [' + courseData.students[i] + ']');

                    log.info('Adding course to student');
                    studentData.courses.push(courseData._id);

                    ctrls.mongodb.save(studentData, (err, _result) => {
                        if (err) {
                            log.error('Failed adding course to student [' + courseData.students[i] + ']');
                            return;
                        }

                        log.info('Successfully added student [' + courseData.students[i] + '] to course');
                    });
                });
            }

            log.info('Successfully created course');
            res.locals = courseData;
            next();
        });
    },
    
    //get all courses
    getAll: (req, res, next) => {
        log.info('Module - GetAll Courses');
        ctrls.mongodb.find(models.courses, {}, (err, results) => {
            if (err) {
                let err = new Error('Failed getting all courses!');
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found all courses.');
            res.locals = results;
            next();
        });
    },
    
    //validate path id parameter
    validatePathId: (req, res, next) => {
        log.info('Module - validatePathId Courses');

        log.info('Validating request...');
        if (!req.params.id) {
            log.error('Request validation failed');
            let err = new Error('Missing required id parameter in the request path. (/courses/:id)');
            err.status = 400;
            next(err);
            return;
        }

        if (!ctrls.mongodb.isObjectId(req.params.id)) {
            log.error('Request validation failed');
            let err = new Error('Invalid id parameter in the request path.');
            err.status = 400;
            next(err);
            return;
        }

        log.info('Request validated!');
        next();
    },
  
    //get a course
    getOne: (req, res, next) => {
        log.info('Module - GetOne Course');
        ctrls.mongodb.findById(models.courses, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed getting course: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found course [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    },

    //delete a course
    deleteOne: (req, res, next) => {
        log.info('Module - DeleteOne Courses');
        ctrls.mongodb.findByIdAndRemove(models.courses, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed deleting course: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully deleted course [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    },

    
    //validate attendence schema
    validateAttendanceCreation: (req, res, next) => {
        log.info('Module - validateAttendanceCreation Courses');

        // Validate schema
        log.info('Validating attendance model...');

        // If empty no validation needed
        if (!req.body || (Object.keys(req.body).length === 0 && req.body.constructor === Object)) {
            log.info('Attendance model has been validated!');
            next();
            return;
        }

        let attendance;
        let error;
        try {
            attendance = new models.attendance(req.body);
            error = attendance.validateSync();
        } catch (error) {
            log.error('Attendance validation Failed!');
            log.info(req.body)
            let err = new Error('Attendance Validation Failed!');
            err.status = 500;
            next(err);
            return;
        }

        if (error) {
            log.error('Attendance model validation failed!');
            let err = new Error('Attendance Validation Failed!');
            err.status = 400;
            // Remove stack trace but keep detailed description of validation errors
            err.data = JSON.parse(JSON.stringify(error));
            next(err);
            return;
        }

        log.info('Attendance model has been validated!');
        next();
    },
    
    //create an attendance
    createAttendance: (req, res, next) => {
        log.info('Module - createAttendance Courses');

        var attendance = (!req.body || (Object.keys(req.body).length === 0 && req.body.constructor === Object)) ?
            new models.attendances({
                course: req.params.id
            }) : new models.attendances(req.body);

        ctrls.mongodb.findById(models.courses, req.params.id, (err, course) => {
            if (err) {
                let err = new Error('Failed getting course: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found course [' + req.params.id + ']');

            log.info('Creating attendance for course [' + req.params.id + ']');
            ctrls.mongodb.save(attendance, (err, result) => {
                if (err) {
                    let err = new Error('Error creating attendance for course [' + req.params.id + ']');
                    err.status = 500;
                    next(err);
                    return;
                }

                log.info('Successfully created attendance');
                res.locals = result;

                log.info('Adding attendance [' + result._id + '] to course [' + course._id + ']');
                course.attendanceHistory.push(result._id);

                ctrls.mongodb.save(course, (err, _result) => {
                    if (err) {
                        let err = new Error('Failed adding attendance [' + result._id + '] to course [' + course._id + ']');
                        err.status = 500;
                        next(err);
                        return;
                    }

                    log.info('Succesfully added attendance [' + result._id + '] to course [' + course._id + ']');
                    next();
                });
            });
        });
    },
    
    //stop attendance
    stopAttendance: (req, res, next) => {
        log.info('Module - stopAttendance Courses');
        let populators = [{
            path: 'presences.student',
            model: 'Students'
        }];
        ctrls.mongodb.findByIdAndPopulate(models.attendances, req.params.attendanceId, populators, (err, attendance) => {
            if (err) {
                let err = new Error('Failed getting attendance: ' + req.params.attendanceId);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found attendance [' + req.params.attendanceId + ']');
            attendance.activated = false;
            res.locals = attendance;
            ctrls.mongodb.save(attendance, (err, _result) => {
                if (err) {
                    let err = new Error('Failed stoping attendance!');
                    err.status = 500;
                    next(err);
                    return;
                }

                log.info('Succesfully stopped attendance [' + req.params.attendanceId + ']');
                next();
            });
        });
    },
    
    //start attendence
    startAttendance: (req, res, next) => {
        log.info('Module - startAttendance Courses');
        let populators = [{
            path: 'presences.student',
            model: 'Students'
        }];
        ctrls.mongodb.findByIdAndPopulate(models.attendances, req.params.attendanceId, populators, (err, attendance) => {
            if (err) {
                let err = new Error('Failed getting attendance: ' + req.params.attendanceId);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found attendance [' + req.params.attendanceId + ']');
            attendance.activated = true;
            res.locals = attendance;
            ctrls.mongodb.save(attendance, (err, _result) => {
                if (err) {
                    let err = new Error('Failed starting attendance!');
                    err.status = 500;
                    next(err);
                    return;
                }

                log.info('Succesfully started attendance [' + req.params.attendanceId + ']');
                next();
            });
        });
    },
    
    //get all attendence of the course
    getAllAttendances: (req, res, next) => {
        log.info('Module - getAllAttendances Courses');
        let populators = [{
            path: 'attendanceHistory',
            populate: {
                path: 'presences.student',
                model: 'Students'
            }
        }];
        ctrls.mongodb.findByIdAndPopulate(models.courses, req.params.id, populators, (err, course) => {
            if (err) {
                let err = new Error('Failed getting course: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found course [' + req.params.id + ']');
            res.locals = course.attendanceHistory;
            next();
        });
    },
    
    //get all course students
    getAllStudents: (req, res, next) => {
        log.info('Module - getAllStudents Courses');
        let populators = [{
            path: 'students',
            populate: {
                path: 'courses',
                model: 'Courses'
            }
        }];
        ctrls.mongodb.findByIdAndPopulate(models.courses, req.params.id, populators, (err, course) => {
            if (err) {
                let err = new Error('Failed getting course: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found course [' + req.params.id + ']');
            res.locals = course.students;
            next();
        });
    },
   
    // Mark a student present in the course for the active attendance
    studentSignIn: (req, res, next) => {
        log.info('Module - studentSignIn Courses');
        let populators = [{
            path: 'attendanceHistory'
        }];
        ctrls.mongodb.findByIdAndPopulate(models.courses, req.params.id, populators, (err, course) => {
            if (err) {
                let err = new Error('Failed getting course: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found course [' + req.params.id + ']');
            //Find first active attendance
            let attendanceId;
            for (let i = 0; i < course.attendanceHistory.length; i++) {
                let attendance = course.attendanceHistory[i];
                if (attendance.activated) {
                    attendanceId = attendance._id;
                    break;
                }
            }

            if (!attendanceId) {
                let err = new Error('No active attendances for this course!');
                err.status = 404;
                next(err);
                return;
            }

            ctrls.mongodb.findById(models.attendances, attendanceId, (err, attendance) => {
                if (err) {
                    log.error('Failed getting attendace: [' + attendanceId + ']');
                    log.error('Failed sign in for student [' + req.params.studentId + ']');
                    return;
                }
                attendance.presences.push({
                    student: req.params.studentId,
                    present: true
                });
                ctrls.mongodb.save(attendance, (err, _result) => {
                    if (err) {
                        log.error('Failed getting attendace: [' + attendanceId + ']');
                        log.error('Failed sign in for student [' + req.params.studentId + ']');
                        return;
                    }

                    log.info('Student [' + req.params.studentId + '] has signed into to course [' + req.params.id + '] on attendance [' + attendanceId + ']');
                });
            });

            ctrls.mongodb.findById(models.students, req.params.studentId, (err, student) => {
                if (err) {
                    log.error('Failed getting student: [' + req.params.studentId + ']');
                    log.error('Failed sign in for student [' + req.params.studentId + ']');
                    return;
                }
                student.attendanceHistory.push(attendanceId);
                log.info('Student [' + req.params.studentId + '] attendance has been updated [' + attendanceId + ']');
                ctrls.mongodb.save(student, (err, _result) => {
                    if (err) {
                        log.error('Failed getting student: [' + req.params.studentId + ']');
                        log.error('Failed sign in for student [' + req.params.studentId + ']');
                        return;
                    }

                    log.info('Student [' + req.params.studentId + '] attendance has been updated [' + attendanceId + ']');
                });
            });

            res.locals = {
                accepted: true
            };
            next();
        });
    },
  
    //  Verify the teacher identity based on JWT
     verifyTeacher: (req, res, next) => {
        log.info('Module - verifyTeacher Courses');
        if (!req.auth) {
            log.error('Missing req.auth decoded token');
            let err = new Error('Invalid Token for authentication, forbidden');
            err.status = 403;
            next(err);
            return;
        }

        if (req.auth.type !== 'teacher') {
            log.error('Invalid user type in token');
            let err = new Error('Unauthorized! Only teachers can access this data!');
            err.status = 401;
            next(err);
            return;
        }

        if (!ctrls.mongodb.isObjectId(req.auth.id)) {
            log.error('Token id is not a valid Mongo DB id');
            let err = new Error('Invalid Token for authentication');
            err.status = 401;
            next(err);
            return;
        }

        ctrls.mongodb.findById(models.courses, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed getting course: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found course [' + req.params.id + ']');

            if (!ctrls.mongodb.isEqual(req.auth.id, result.teacher)) {
                log.error('User is unauthorized to access this data.');
                let err = new Error('User is unauthorized to access this data.');
                err.status = 401;
                next(err);
                return;
            }

            log.info('Authorized');
            next();
        });
    },
    
    // Verify the identity as teacher or student in course  based on JWT
    verifyTeacherOrStudent: (req, res, next) => {
        log.info('Module - verifyTeacherOrStudent Courses');
        if (!req.auth) {
            log.error('Missing req.auth decoded token');
            let err = new Error('Invalid Token for authentication, forbidden');
            err.status = 403;
            next(err);
            return;
        }

        if (req.auth.type !== 'teacher' && req.auth.type !== 'student') {
            log.error('Invalid user type in token');
            let err = new Error('Invalid Token for authentication, forbidden');
            err.status = 403;
            next(err);
            return;
        }

        if (!ctrls.mongodb.isObjectId(req.auth.id)) {
            log.error('Token id is not a valid Mongo DB id');
            let err = new Error('Invalid Token for authentication');
            err.status = 401;
            next(err);
            return;
        }

        ctrls.mongodb.findById(models.courses, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed getting course: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found course [' + req.params.id + ']');


            if (req.auth.type === 'teacher') {
                if (!ctrls.mongodb.isEqual(req.auth.id, result.teacher)) {
                    log.error('User is unauthorized to access this data.');
                    let err = new Error('User is unauthorized to access this data.');
                    err.status = 401;
                    next(err);
                    return;
                }
            } else {
                if (result.students.indexOf(req.auth.id) < 0) {
                    log.error('User is unauthorized to access this data.');
                    let err = new Error('User is unauthorized to access this data.');
                    err.status = 401;
                    next(err);
                    return;
                }
            }
            log.info('Authorized');
            next();
        });
    }
};