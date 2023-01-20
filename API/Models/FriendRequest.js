const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    sender: mongoose.SchemaTypes.ObjectId,
    recipient: mongoose.SchemaTypes.ObjectId,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
})

const FriendRequest =  mongoose.model("FriendRequest", FriendRequestSchema)

module.exports = { FriendRequestSchema, FriendRequest }