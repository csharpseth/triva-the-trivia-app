const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    sender: mongoose.SchemaTypes.ObjectId,
    senderUsername: String,
    recipient: mongoose.SchemaTypes.ObjectId,
    recipientUsername: String,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
})

const FriendRequest =  mongoose.model("FriendRequest", FriendRequestSchema)

module.exports = { FriendRequestSchema, FriendRequest }