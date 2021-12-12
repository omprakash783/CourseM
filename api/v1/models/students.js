const mongoose = require('mongoose');

var validate = {
    alphaNumeric: {
        validator: (v) => {
            return /^[a-zA-Z0-9-_ ]*$/.test(v);
        },
        message: 'Only alpha-numeric values are accepted!'
    },
    strictNumber: {
        validator: (v) => {
            return !isNaN(parseFloat(v)) && isFinite(v);
        },
        message: 'This field must be a number!'
    }
};


var assignment = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'title is a required field!']
    },
    completed: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    completionDate: {
        type: Date
    },
    startDate: {
        type: Date
    },
    mark: {
        type: Number,
        default: 0,
        validate: validate.strictNumber
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses'
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignments'
    }
});




var schema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'firstName is a required field!'],
        validate: validate.alphaNumeric
    },
    lastName: {
        type: String,
        required: [true, 'lastName is a required field!'],
        validate: validate.alphaNumeric
    },
    username: {
        type: String,
        required: [true, 'username is a required field!'],
        unique: [true, 'username must be unique'],
        validate: validate.alphaNumeric
    },
    password: {
        type: String,
        required: true,
        required: [true, 'password is a required field!'],
        select: false
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses'
    }],
    attendanceHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attendances',
        default: []
    }],
    assignments: {
        type: [assignment],
        default: []
    }
});

module.exports = mongoose.model('Students', schema);