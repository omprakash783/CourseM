const log = require('winston');
var ctrls = require('../controllers');
var models = require('../models');

module.exports = {
   
    //validate the assignment schema
    validateCreate: (req, res, next) => {
        log.info('Module - ValidateCreate Assignment');

        // Validate schema
        log.info('Validating assignment model...')
        var assignment = new models.assignments(req.body);
        var error = assignment.validateSync();

        if (error) {
            log.error('Assignment model validation failed!');
            let err = new Error('Assignment Validation Failed!');
            err.status = 400;
            // Remove stack trace but keep detailed description of validation errors
            err.data = JSON.parse(JSON.stringify(error));
            next(err);
            return;
        }

        log.info('Assignment model has been validated!');
        next();
    },
    
    //create an assignment
    create: (req, res, next) => {
        log.info('Module - Create Assignment');
        var assignment = new models.assignments(req.body);
        ctrls.mongodb.save(assignment, (err, result) => {
            if (err) {
                let err = new Error('Oops something went wrong!');
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully created assignment');
            res.locals = result;
            next();
        });
    },
    
    //get all assignments
    getAll: (req, res, next) => {
        log.info('Module - GetAll Assignments');
        ctrls.mongodb.find(models.assignments, {}, (err, results) => {
            if (err) {
                let err = new Error('Failed getting all assignments!');
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found all assignments.');
            res.locals = results;
            next();
        });
    },
   
    //validate id parameter
    validatePathId: (req, res, next) => {
        log.info('Module - validatePathId Assignment');

        log.info('Validating request...');
        if (!req.params.id) {
            log.error('Request validation failed');
            let err = new Error('Missing required id parameter in the request path.');
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
    
    //get an assignment
    getOne: (req, res, next) => {
        log.info('Module - GetOne Assignment');
        ctrls.mongodb.findById(models.assignments, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed getting assignment: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found assignment [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    },
    
    //Delete the assignment
    deleteOne: (req, res, next) => {
        log.info('Module - DeleteOne Assignment');
        ctrls.mongodb.findByIdAndRemove(models.assignments, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed deleting assignment: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully deleted assignment [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    },
};