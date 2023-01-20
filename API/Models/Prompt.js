const mongoose = require('mongoose');

const PromptSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answers: {
        type: [String],
        required: true,
    },
    correctAnswers: {
        type: [Number],
        required: true,
    },
    difficulty: {
        type: Number,
        required: true,
        min: 0,
        max: 2,
    },
    topic: {
        type: String,
        required: true
    }
})

module.exports.PromptSchema = PromptSchema
module.exports.PromptModel = mongoose.model("Prompt", PromptSchema)