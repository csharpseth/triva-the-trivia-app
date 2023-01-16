const mongoose = require('mongoose');

const { FriendRequestSchema } = require('../Models/FriendRequest')

const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
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
    friends: [mongoose.Schema.ObjectId],
    friendRequestsReceived: [FriendRequestSchema],
    FriendRequestsSent: [FriendRequestSchema],
    hosted_sessions: [mongoose.Schema.ObjectId],
    connected_sessions: [mongoose.Schema.ObjectId],
    authentication: {
        loggedIn: {
            type: Boolean,
            default: false,
        },
        key: String,
    }
})

module.exports = mongoose.model("User", UserSchema)