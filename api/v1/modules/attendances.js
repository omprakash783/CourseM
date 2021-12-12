const log = require('winston');
var ctrls = require('../controllers');
var models = require('../models');

module.exports = {
    /**
     * Gets all attendances
     * @param  {object}   req  Request object
     * @param  {object}   res  Response object
     * @param  {Function} next Callback function to move on to the next middleware
     * @return {object}        Populates res.locals with array of all attendance documents
     */
    getAll: (req, res, next) => {
        log.info('Module - getAll Attendances');
        ctrls.mongodb.find(models.attendances, {}, (err, results) => {
            if (err) {
                let err = new Error('Failed getting all attendances!');
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found all attendances.');
            res.locals = results;
            next();
        });
    },
    
    
    //  Validates path id parameter
     
    validatePathId: (req, res, next) => {
        log.info('Module - validatePathId Attendance');

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
    
    //  Gets attendance of particular student
     
    getOne: (req, res, next) => {
        log.info('Module - GetOne Attendance');
        ctrls.mongodb.findById(models.attendances, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed getting attendance: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully found attendance [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    },
    
    //Delete an attedance
    deleteOne: (req, res, next) => {
        log.info('Module - DeleteOne Attendance');
        ctrls.mongodb.findByIdAndRemove(models.attendances, req.params.id, (err, result) => {
            if (err) {
                let err = new Error('Failed deleting attendance: ' + req.params.id);
                err.status = 500;
                next(err);
                return;
            }
            log.info('Successfully deleted attendance [' + req.params.id + ']');
            res.locals = result;
            next();
        });
    }
};