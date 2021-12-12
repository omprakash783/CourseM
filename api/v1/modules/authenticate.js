const log = require('winston');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
var ctrls = require('../controllers');
var models = require('../models');
var config = require('../../../config');

module.exports = {
    giveToken: (req, res, next) => {

        // Verify payload has required parameters
        if (!req.body.userType) {
            log.error('userType is a required field!');
            let err = new Error('userType is a required field!');
            err.status = 400;
            next(err);
            return;
        }
        if (!req.body.username) {
            log.error('username is a required field!');
            let err = new Error('username is a required field!');
            err.status = 400;
            next(err);
            return;
        }
        if (!req.body.password) {
            log.error('password is a required field!');
            let err = new Error('password is a required field!');
            err.status = 400;
            next(err);
            return;
        }

        // Check user type of login, whether it's student or teacher
        var userType;
        switch (req.body.userType) {
            case 'teacher':
                userType = models.teachers;
                break;
            case 'student':
                userType = models.students;
                break;
            default:
                log.error('Invalid User Type!');
                let err = new Error('Invalid User Type!');
                err.status = 400;
                next(err);
                return;
        }

        ctrls.mongodb.findOne(userType, {
            'username': req.body.username
        }, (error, result) => {

            if (error) {
                log.error('User authentification failed!');
                let err = new Error('User authentification failed!');
                err.status = 400;
                // Remove stack trace but keep detailed description of validation errors
                err.data = JSON.parse(JSON.stringify(error));
                next(err);
                return;
            }

            var user = result;

            if (!user) {
                log.info('Authentication failed: User not found.');
                let err = new Error('Authentication failed: User not found.');
                err.status = 404;
                next(err);
                return;
            }

            var hashResult;

            // compare hashed password and input password
            try {
                hashResult = bcrypt.compareSync(req.body.password, user.password);
            } catch (error) {
                log.error('Bcrypt compareSync failed!');
                let err = new Error('Internal Server Error');
                err.status = 500;
                next(err);
                return;
            }

            if (!hashResult) {
                log.info('Authentication failed: Wrong password.');
                let err = new Error('Unauthorized: Wrong password.');
                err.status = 401;
                err.data = {
                    username: req.body.username
                };
                next(err);
                return;
            }

            var token;
            try {
                token = jwt.sign({
                    'id': user._id,
                    'type': req.body.userType
                }, config.tokenSecret, {
                    expiresIn: '24h' // expires in 24 hours
                });
            } catch (error) {
                log.error('JWT sign failed!');
                let err = new Error('Internal Server Error');
                err.status = 500;
                next(err);
                return;
            }


            // return response as JWT
            res.locals = {
                success: true,
                token: token,
                userType: req.body.userType,
                id: user._id
            };

            next();
        });
    }
};