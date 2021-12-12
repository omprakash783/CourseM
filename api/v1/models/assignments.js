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
    creationDate: {
        type: Date
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    weight: {
        type: Number,
        default: 0
    }
});
module.exports = mongoose.model('Assignments', schema);