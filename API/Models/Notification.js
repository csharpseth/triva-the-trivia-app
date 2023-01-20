const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },
})
const Notification = mongoose.model("Notification", InviteSchema)

module.exports = { NotificationSchema, Notification }