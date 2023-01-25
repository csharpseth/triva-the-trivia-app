const mongoose = require('mongoose');

const { FriendRequestSchema } = require('../Models/FriendRequest');
const { InviteSchema } = require('./Invite');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
    modifiedAt: {
        type: Date,
        default: () => Date.now(),
    },
    passwordHash: {
        type: String,
        required: true,
    },
    score: {
        type: Number,
        default: 0,
        min: 0,
    },
    likes: {
        type: Number,
        default: 0,
        min: 0,
    },
    friends: {
        type: [mongoose.Schema.ObjectId],
        default: []
    },
    friendRequestReceived: {
        type: [FriendRequestSchema],
        default: []
    },
    friendRequestSent: {
        type: [FriendRequestSchema],
        default: []
    },
    invitesReceived: {
        type: [InviteSchema],
        default: []
    },
    invitesSent: {
        type: [InviteSchema],
        default: []
    },
    hosted_sessions: {
        type: [mongoose.Schema.ObjectId],
        default: []
    },
    connected_sessions: {
        type: [mongoose.Schema.ObjectId],
        default: []
    },

    socket_id: String,

    authentication: {
        loggedIn: {
            type: Boolean,
            default: false,
        },
        key: String,
    }
})

module.exports = mongoose.model("User", UserSchema)