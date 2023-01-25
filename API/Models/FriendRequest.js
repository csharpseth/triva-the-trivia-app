const mongoose = require('mongoose');

const FriendRequestSchema = new mongoose.Schema({
    sender: mongoose.SchemaTypes.ObjectId,
    senderUsername: String,
    senderName: String,
    recipient: mongoose.SchemaTypes.ObjectId,
    recipientUsername: String,
    recipientName: String,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
})

const FriendRequest =  mongoose.model("FriendRequest", FriendRequestSchema)

module.exports = { FriendRequestSchema, FriendRequest }