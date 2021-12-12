const log = require('winston');
const bcrypt = require('bcrypt');
var ctrls = require('../controllers');
var models = require('../models');

module.exports = {
    //validate 
    validateCreate: (req, res, next) => {
        log.info('Module - ValidateCreate Teacher');

        // Validate schema
        log.info('Validating teacher model...')
        var teacher = new models.teachers(req.body);
        var error = teacher.validateSync();

        if (error) {
            log.error('Teacher model validation failed!');
            let err = new Error('Teacher Validation Failed!');
            err.status = 400;
            // Remove stack trace but keep detailed description of validation errors
            err.data = JSON.parse(JSON.stringify(error));
            next(err);
            return;
        }

        log.info('Teacher model has been validated!');
        next();
    },
    
    //create a teacher
    create: (req, res, next) => {
        log.info('Module - Create Teacher');
        var teacher = new models.teachers(req.body);
        // Hash Password
        var saltRounds = 10;
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                teacher.password = hash;
                ctrls.mongodb.save(teacher, (err, result) => {
                    if (err) {
                        let err = new Error('Failed creating teacher!');
                        err.status = 500;
                        next(err);
                        return;
                    }
                    log.info('Successfully created teacher');
                    res.locals = JSON.parse(JSON.stringify(result));
                    delete res.locals['password'];
                    next();
                });
            });
        });
    },
   
    //get all teachers
    getAll: (req, res, next) => {
        log.info('Module - GetAll Teachers');
        ctrls.mongodb.find(models.teachers, {}, (err, results) => {
            if (err) {
                let err = new Error('Failed getting all teachers!');
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found all teachers.');
            res.locals = results;
            next();
        });
    },
    
    //validate id
    validatePathId: (req, res, next) => {
        log.info('Module - validatePathId Teacher');

        log.info('Validating request...');
        if (!req.params.id) {
            log.error('Request validation failed');
            let err = new Error('Missing required id parameter in the request path. (/teachers/:id)');
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
    
    //get the teacher
    getOne: (req, res, next) => {
        log.info('Module - GetOne Teacer');
        let populators = [{
            path: 'classrooms'
        }];
        ctrls.mongodb.findByIdAndPopulate(models.teachers, req.params.id, populators, (err, result) => {
            if (err) {
                let err = new Error('Failed getting teacher: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found teacher [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    },
    
    //delete the teacher
    deleteOne: (req, res, next) => {
        log.info('Module - DeleteOne Teacher');
        ctrls.mongodb.findByIdAndRemove(models.teachers, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed deleting teacher: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully deleted teacher [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    },
    
    //verify id on based of jwt
    verifyId: (req, res, next) => {
        log.info('Module - verifyId teacher');
        if (!req.auth) {
            log.error('Missing req.auth decoded token');
            let err = new Error('Invalid Token for authentication, forbidden');
            err.status = 403;
            next(err);
            return;
        }

        if (req.auth.type !== 'teacher') {
            log.error('Not a teacher');
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
    }
};