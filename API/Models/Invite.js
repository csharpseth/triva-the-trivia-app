const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
    session: mongoose.SchemaTypes.ObjectId,
    inviter: mongoose.SchemaTypes.ObjectId,
    invitee: mongoose.SchemaTypes.ObjectId,
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
})

module.exports.InviteSchema = InviteSchema
module.exports.InviteModel = mongoose.model("Invite", InviteSchema)