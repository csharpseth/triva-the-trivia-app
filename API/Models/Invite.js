const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
    session: mongoose.SchemaTypes.ObjectId,
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
const Invite = mongoose.model("Invite", InviteSchema)

module.exports = { InviteSchema, Invite }