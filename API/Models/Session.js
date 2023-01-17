const mongoose = require('mongoose');
const {InviteSchema} = require('../Models/Invite')

const SessionSchema = new mongoose.Schema({
    host: {
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
    },
    topic: {
        type: String,
        required: true,
    },
    key: {
        type: String,
        required: true,
    },
    connected_users: [mongoose.Schema.ObjectId],
    current_prompt: mongoose.Schema.ObjectId,
    invites: [InviteSchema],
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
})

module.exports = mongoose.model("Session", SessionSchema)