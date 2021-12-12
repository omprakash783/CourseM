const mongoose = require('mongoose');

var validate = {
    alphaNumeric: {
        validator: (v) => {
            return /^[a-zA-Z0-9-_ ]*$/.test(v);
        },
        message: 'Only alpha-numeric values are accepted!'
    }
};

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
        required: [true, 'password is a required field!'],
        select: false
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courses'
    }]
});

module.exports = mongoose.model('Teachers', schema);