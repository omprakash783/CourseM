const log = require('winston');
const bcrypt = require('bcrypt')
var ctrls = require('../controllers');
var models = require('../models');

module.exports = {
    //validate the student schema
    validateCreate: (req, res, next) => {
        log.info('Module - ValidateCreate Student');

        // Validate schema
        log.info('Validating student model...')
        var student = new models.students(req.body);
        var error = student.validateSync();

        if (error) {
            log.error('Student model validation failed!');
            let err = new Error('Student Validation Failed!');
            err.status = 400;
            // Remove stack trace but retain detailed description of validation errors
            err.data = JSON.parse(JSON.stringify(error));
            next(err);
            return;
        }

        log.info('Student model has been validated!');
        next();
    },
    
    //create a student
    create: (req, res, next) => {
        log.info('Module - Create Student');

        var student = new models.students(req.body);
        // Hash Password
        var saltRounds = 10;
        bcrypt.genSalt(saltRounds, function(error, salt) {
            bcrypt.hash(req.body.password, salt, function(error, hash) {
                student.password = hash;
                ctrls.mongodb.save(student, (error, result) => {
                    if (error) {
                        let err = new Error('Failed creating student!');
                        err.status = 500;
                        next(err);
                        return;
                    }
                    log.info('Successfully created student.');
                    res.locals = JSON.parse(JSON.stringify(result));
                    delete res.locals['password'];
                    next();
                });
            });
        });

    },
   
    //get all students
    getAll: (req, res, next) => {
        log.info('Module - GetAll Students');
        ctrls.mongodb.find(models.students, {}, (err, results) => {
            if (err) {
                let err = new Error('Failed getting all students!');
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found all students.');
            res.locals = results;
            next();
        });
    },
    
    //validate the id parameter
    validatePathId: (req, res, next) => {
        log.info('Module - validatePathId Student');

        log.info('Validating request...');
        if (!req.params.id) {
            log.error('Request validation failed');
            let err = new Error('Missing required id parameter in the request path. (/students/:id)');
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
    
    //get the student
    getOne: (req, res, next) => {
        log.info('Module - GetOne Student');
        let populators = [{
            path: 'classrooms'
        }];
        ctrls.mongodb.findByIdAndPopulate(models.students, req.params.id, populators, (err, result) => {
            if (err) {
                let err = new Error('Failed getting student: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found student [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    },
   
    //delete the student
    deleteOne: (req, res, next) => {
        log.info('Module - DeleteOne Student');
        ctrls.mongodb.findByIdAndRemove(models.students, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed deleting student: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully deleted student [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    },
    
    //validate an assignment for a student
    validateAssignment: (req, res, next) => {
        log.info('Module - ValidateAssignment Student');

        // Validate schema
        log.info('Validating student assignment...');
        let fakeStudent = new models.students({
            assignments: [req.body]
        });

        let student = new models.students(fakeStudent);
        let error = student.validateSync();

        if (error.errors['assignments']) {
            log.error('Student assignment validation failed!');
            let err = new Error('Student Assignment Validation Failed!');
            err.status = 400;
            // Remove stack trace but keep detailed description of validation errors
            err.data = JSON.parse(JSON.stringify(error.errors['assignments']));
            next(err);
            return;
        }

        log.info('Student assignment has been validated!');
        next();
    },
   
    //create an assignment for the student
    createAssignment: (req, res, next) => {
        log.info('Module - CreateAssignment Student');
        ctrls.mongodb.findById(models.students, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed getting student!');
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found student [' + req.params.id + ']');

            log.info('Creating student assignment');
            result.assignments.push(req.body);

            ctrls.mongodb.save(result, (err, _result) => {
                if (err) {
                    let err = new Error('Failed creating student assignment!');
                    err.status = 500;
                    next(err);
                    return;
                }

                log.info('Successfully created assignment for student [' + req.params.id + ']');

                res.locals = _result;
                next();
            });
        });
    },
    
    //validate assignment id
    validateAssignmentId: (req, res, next) => {
        log.info('Module - ValidateAssignmentId Student');

        log.info('Validating assignmentId...');
        if (!req.params.assignmentId) {
            log.error('Assignment ID validation failed');
            let err = new Error('Missing required assignment id parameter in the request path.');
            err.status = 400;
            next(err);
            return;
        }

        if (!ctrls.mongodb.isObjectId(req.params.assignmentId)) {
            log.error('assignmentId validation failed');
            let err = new Error('Invalid assignment id parameter in the request path.');
            err.status = 400;
            next(err);
            return;
        }
        log.info('assignmentId has been validated!');
        next();
    },
  
    //delete an assignment for the student
    deleteAssignment: (req, res, next) => {
        log.info('Module - DeleteAssignment Student');
        ctrls.mongodb.findById(models.students, req.params.id, (err, student) => {
            if (err) {
                let err = new Error('Failed getting student: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found student [' + req.params.id + ']');

            //linear search
            log.info('Searching student for assignment [' + req.params.assignmentId + ']');
            let found = false;
            for (let i = 0; i < student.assignments; i++) {
                if (ctrls.mongodb.isEqual(student.assignments[i].assignment, req.params.assignmentId)) {
                    found = true;
                    log.info('Found student assignment [' + req.params.assignmentId + ']');
                    res.locals = student.assignments[i];
                    log.info('Removing student assignment [' + req.params.assignmentId + ']');
                    student.assignments.splice(i, 1);
                    break;
                }
            }

            if (!found) {
                let err = new Error('Assignment not found: ' + req.params.assignmentId);
                err.status = 404;
                next(err);
                return;
            }

            next();
        });
    },
   
    //verify student id based on jwt
    verifyId: (req, res, next) => {
        log.info('Module - verifyId Student');
        if (!req.auth) {
            log.error('Missing req.auth decoded token');
            let err = new Error('Invalid Token for authentication, forbidden');
            err.status = 403;
            next(err);
            return;
        }

        if (req.auth.type === 'teacher') {
            log.info('Teacher authenticated, access granted');
            next();
            return;
        }

        if (req.auth.type !== 'student') {
            log.error('Unkown user type');
            let err = new Error('Invalid Token for authentication');
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

        if (!ctrls.mongodb.isEqual(req.auth.id, req.params.id)) {
            log.error('User is unauthorized to access this data.');
            let err = new Error('Unauthorized');
            err.status = 401;
            next(err);
            return;
        }

        log.info('Authorized');
        next();
    },

   
    //assign assignment to a list of students
    createAssignments: (req, res, next) => {
        log.info('Module - createAssignments Student');
        for (let i = 0; i < req.body.students.length; i++) {
            ctrls.mongodb.findById(models.students, req.body.students[i], (err, result) => {
                if (err) {
                    log.error('Failed creating assignment for student');
                    return;
                }
                log.info('Successfully found student [' + result._id + ']');

                log.info('Creating student assignment');
                result.assignments.push(req.body.assignment);

                ctrls.mongodb.save(result, (err, _result) => {
                    if (err) {
                        log.error('Failed creating assignment for student [' + result._id + ']');
                        return;
                    }
                    log.info('Successfully created assignment for student [' + result._id + ']');
                });
            });
        }
        res.locals = {
            accepted: true
        };
        next();
    }
};