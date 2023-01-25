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
    topic: {
        type: String,
        required: true,
    },
    difficulty: {
        type: Number,
        required: true,
        min: 0,
        max: 2,
    },
    maxUsers: {
        type: Number,
        required: false,
        default: 10
    },
    allowUserInvites: {
        type: Boolean,
        default: true
    },
    key: {
        type: String,
        required: true,
    },
    connected_users: {
        type: [mongoose.Schema.ObjectId],
        default: []
    },
    current_prompt: mongoose.Schema.ObjectId,
    invites: {
        type: [InviteSchema],
        default: []
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
})

module.exports = mongoose.model("Session", SessionSchema)