const mongoose = require('mongoose');
var schema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'title is a required field']
    },
    description: {
        type: String,
        default: ''
    },
    courseCode: {
        type: String,
        default: ''
    },
    year: {
        type: Number,
        required: [true, 'year is a required field']
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Students',
        default: []
    }],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teachers',
        required: [true, 'teacher is a required field']
    },
    attendanceHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attendances',
        default: []
    }],
});
module.exports = mongoose.model('Courses', schema);