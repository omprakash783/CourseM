const mongoose = require('mongoose');

var getFormattedDate = () => {
    var currentdate = new Date();
    var datetime = currentdate.getDate() + '/' +
        (currentdate.getMonth() + 1) + '/' +
        currentdate.getFullYear();
    return datetime;
};

var presence = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Students',
    },
    present: {
        type: Boolean,
        default: false
    }

}, {
    _id: false
});

var schema = new mongoose.Schema({
    title: {
        type: String,
        default: 'Attendance for ' + getFormattedDate()
    },
    date: {
        type: Date,
        default: Date.now
    },
    activated: {
        type: Boolean,
        default: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses',
    },
    presences: {
        type: [presence],
        default: []
    }
});

module.exports = mongoose.model('Attendances', schema);