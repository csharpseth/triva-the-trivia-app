const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
    prompt: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    corrrectAnswerScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 100,
    },
    incorrrectAnswerScore: {
        type: Number,
        required: true,
        min: -20,
        max: 20,
        default: 0,
    },
    topic: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    }
})

module.exports.PromptSchema = PromptSchema
module.exports.PromptModel = mongoose.model("Prompt", PromptSchema)