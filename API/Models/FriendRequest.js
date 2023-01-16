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

module.exports.FriendRequestSchema = FriendRequestSchema
module.exports.FriendRequestModel = mongoose.model("FriendRequest", FriendRequestSchema)