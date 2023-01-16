const mongoose = require('mongoose');

const {TopicSchema} = require('../Models/Topic')
const {PromptSchema} = require('../Models/Prompt')
const {InviteSchema} = require('../Models/Invite')

const SessionSchema = new mongoose.Schema({
    host: mongoose.Schema.ObjectId,
    title: String,
    key: {
        type: String,
        required: true,
    },
    connected_users: [mongoose.Schema.ObjectId],
    current_prompt: mongoose.Schema.ObjectId,
    topic: TopicSchema,
    invites: [InviteSchema],
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
})

module.exports = mongoose.model("Session", SessionSchema)